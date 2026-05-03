"use client";

import { useClerk } from "@clerk/nextjs";
import { X, Home, Star, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onClose: () => void;
}

export function UsageGateModal({ onClose }: Props) {
  const { openSignUp, openSignIn } = useClerk();

  function handleSignUp() {
    onClose();
    openSignUp();
  }

  function handleSignIn() {
    onClose();
    openSignIn();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-modal-title"
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Top banner */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-8 py-8 text-center text-white">
          <div className="mb-3 flex justify-center"><Home className="h-12 w-12 text-blue-300" /></div>
          <h2 id="gate-modal-title" className="text-2xl font-extrabold">You&apos;ve explored 10 listings!</h2>
          <p className="mt-2 text-blue-200 text-sm">
            Create a free account to keep browsing ShulSearch
          </p>
        </div>

        {/* Benefits */}
        <div className="px-8 py-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
              <Home className="h-4 w-4" />
            </div>
            Unlimited property browsing
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 flex-shrink-0">
              <Star className="h-4 w-4" />
            </div>
            Save your favorite listings
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            Contact agents directly
          </div>
        </div>

        {/* CTAs */}
        <div className="px-8 pb-8 space-y-3">
          <Button
            className="w-full h-12 text-base font-semibold rounded-xl"
            onClick={handleSignUp}
          >
            Create Free Account
          </Button>
          <button
            onClick={handleSignIn}
            className="w-full text-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            Already have an account? <span className="font-semibold text-blue-600">Sign in</span>
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
