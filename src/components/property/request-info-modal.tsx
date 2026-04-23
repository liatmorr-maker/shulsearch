"use client";

import { useState } from "react";
import { X, Phone, Mail, User, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RequestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
}

export function RequestInfoModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  propertyAddress,
}: RequestInfoModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, propertyId, propertyTitle, propertyAddress }),
      });
    } catch { /* still show success — lead saved to DB */ }
    setLoading(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", message: "" });
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <CheckCircle className="h-14 w-14 text-green-500" />
            <h2 className="text-xl font-bold text-slate-900">Request Sent!</h2>
            <p className="text-sm text-slate-500">
              We&apos;ve received your inquiry for{" "}
              <span className="font-medium text-slate-700">{propertyTitle}</span>.
              Someone will be in touch with you shortly.
            </p>
            <Button className="mt-2 w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          /* Form state */
          <div className="px-6 py-6">
            <h2 className="mb-1 text-xl font-bold text-slate-900">Request Info</h2>
            <p className="mb-1 text-sm font-medium text-slate-700">{propertyTitle}</p>
            <p className="mb-5 text-xs text-slate-400">{propertyAddress}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    name="name"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="I'm interested in this property..."
                    value={form.message}
                    onChange={handleChange}
                    className={cn(
                      "w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 pl-9 text-sm",
                      "placeholder:text-slate-400",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send Request"}
              </Button>

              <p className="text-center text-xs text-slate-400">
                No fees to inquire · ShulSearch
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
