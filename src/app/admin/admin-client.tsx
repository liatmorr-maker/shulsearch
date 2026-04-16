"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Home, MessageSquare, CheckCircle2,
  XCircle, Search, MapPin, AlertCircle, ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { MockSynagogue } from "@/lib/mock-data";
import { DENOMINATION_LABELS, DENOMINATION_COLORS, formatPrice, cn } from "@/lib/utils";

interface AdminProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  listingType: "SALE" | "RENT";
  status: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  imageUrls: string[];
  isApproved: boolean;
  isFeatured: boolean;
  nearestSynagugueDist?: number;
  synagogueCount1mi: number;
  synagogueDistances: {
    synagogueId: string;
    distanceMi: number;
    walkMinutes: number;
    synagogue: { denomination: string; name: string; lat: number; lng: number };
  }[];
}

interface AdminLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  createdAt: string;
  property: { id: string; title: string; price: number; listingType: "SALE" | "RENT" } | null;
}

interface AdminClientProps {
  initialProperties: AdminProperty[];
  synagogues: MockSynagogue[];
  leads: AdminLead[];
}

export function AdminClient({ initialProperties, synagogues, leads }: AdminClientProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [synSearch, setSynSearch] = useState("");
  const [propSearch, setPropSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ imported: number; skipped: number } | null>(null);

  const filteredSynagogues = synagogues.filter(
    (s) =>
      s.name.toLowerCase().includes(synSearch.toLowerCase()) ||
      s.city.toLowerCase().includes(synSearch.toLowerCase())
  );

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.address.toLowerCase().includes(propSearch.toLowerCase())
  );

  async function approveAll() {
    const res = await fetch("/api/admin/properties/approve-all", { method: "POST" });
    if (res.ok) {
      setProperties((prev) => prev.map((p) => ({ ...p, isApproved: true })));
    }
  }

  async function toggleApproval(id: string, currentValue: boolean) {
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !currentValue }),
    });
    if (res.ok) {
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isApproved: !currentValue } : p))
      );
    }
  }

  async function runSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync-listings", { method: "POST" });
      const data = await res.json();
      setSyncResult(data);
      // Reload page to show new properties
      if (data.imported > 0) window.location.reload();
    } catch {
      setSyncResult({ imported: 0, skipped: -1 });
    } finally {
      setSyncing(false);
    }
  }

  const pendingApproval = properties.filter((p) => !p.isApproved).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">Manage synagogues, listings, and leads</p>
        </div>
        <div className="flex items-center gap-3">
          {syncResult && (
            <span className="text-sm text-emerald-600 font-medium">
              ✓ {syncResult.imported} imported
            </span>
          )}
          <Button
            onClick={runSync}
            disabled={syncing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
            {syncing ? "Syncing MLS…" : "Sync MLS Listings"}
          </Button>
          <Badge variant="destructive" className="text-xs">Admin Only</Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Home}        label="Total Listings"   value={properties.length}  color="blue" />
        <StatCard icon={Building2}   label="Synagogues"       value={synagogues.length}  color="indigo" />
        <StatCard icon={AlertCircle} label="Pending Approval" value={pendingApproval}    color="amber" />
        <StatCard icon={MessageSquare} label="Leads"          value={leads.length}       color="emerald" />
      </div>

      <Tabs defaultValue="properties">
        <TabsList className="mb-6 h-auto flex-wrap">
          <TabsTrigger value="properties" className="gap-1.5">
            <Home className="h-3.5 w-3.5" /> Properties
            {pendingApproval > 0 && (
              <Badge className="text-xs px-1.5 py-0 bg-amber-500 text-white">{pendingApproval} pending</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="synagogues" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Synagogues
            <Badge variant="secondary" className="text-xs px-1.5 py-0">{synagogues.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Leads
            <Badge variant="secondary" className="text-xs px-1.5 py-0">{leads.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Properties tab ──────────────────────────────── */}
        <TabsContent value="properties">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search listings…"
                value={propSearch}
                onChange={(e) => setPropSearch(e.target.value)}
              />
            </div>
            {pendingApproval > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  {pendingApproval} pending
                </div>
                <Button size="sm" onClick={approveAll} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                  Approve All
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)] bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Property</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">City</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Price</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Nearest Shul</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((prop) => {
                  const nearestShul = prop.synagogueDistances?.[0];
                  return (
                    <tr
                      key={prop.id}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors",
                        !prop.isApproved && "bg-amber-50/40"
                      )}
                    >
                      <td className="px-4 py-3 max-w-[180px]">
                        <div className="font-medium text-slate-900 truncate">{prop.title}</div>
                        <div className="text-xs text-slate-400">{prop.beds}bd · {prop.baths}ba{prop.sqft ? ` · ${prop.sqft.toLocaleString()} sqft` : ""}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell whitespace-nowrap">
                        {prop.city}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-medium text-slate-800 whitespace-nowrap">
                        {formatPrice(prop.price, prop.listingType)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-blue-700">
                        {nearestShul ? (
                          <span>✡ {nearestShul.distanceMi.toFixed(2)} mi</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {prop.isApproved ? (
                          <Badge variant="success" className="text-xs">Live</Badge>
                        ) : (
                          <Badge variant="warning" className="text-xs">Pending</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/property/${prop.id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              View <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant={prop.isApproved ? "outline" : "default"}
                            className={cn("h-7 px-2 text-xs", prop.isApproved && "text-red-600 border-red-200 hover:bg-red-50")}
                            onClick={() => toggleApproval(prop.id, prop.isApproved)}
                          >
                            {prop.isApproved ? "Unpublish" : "Approve"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProperties.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">No listings found.</p>
            )}
          </div>
        </TabsContent>

        {/* ── Synagogues tab ──────────────────────────────── */}
        <TabsContent value="synagogues">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search synagogues…"
                value={synSearch}
                onChange={(e) => setSynSearch(e.target.value)}
              />
            </div>
            <Button size="sm">+ Add Synagogue</Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)] bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">City</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Denomination</th>
                  <th className="px-4 py-3 text-center">Verified</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSynagogues.map((syn) => (
                  <tr key={syn.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                      {syn.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {syn.city}, {syn.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        DENOMINATION_COLORS[syn.denomination] ?? "bg-gray-100 text-gray-800")}>
                        {DENOMINATION_LABELS[syn.denomination] ?? syn.denomination}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {syn.isVerified ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-300 inline" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/synagogue/${syn.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            View <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">Edit</Button>
                        {!syn.isVerified && (
                          <Button size="sm" className="h-7 px-2 text-xs">Verify</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSynagogues.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">No synagogues match your search.</p>
            )}
          </div>
        </TabsContent>

        {/* ── Leads tab ──────────────────────────────────── */}
        <TabsContent value="leads">
          {leads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
              <p className="text-sm text-slate-400">No leads yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col sm:flex-row gap-4 rounded-xl border border-[var(--border)] bg-white p-5 shadow-card"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-900">{lead.name}</span>
                        <span className="ml-2 text-sm text-slate-500">{lead.email}</span>
                        {lead.phone && <span className="ml-2 text-sm text-slate-500">{lead.phone}</span>}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                        })}
                      </span>
                    </div>
                    {lead.property && (
                      <Link
                        href={`/property/${lead.property.id}`}
                        className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline"
                      >
                        <Home className="h-3 w-3" />
                        {lead.property.title} · {formatPrice(lead.property.price, lead.property.listingType)}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                    {lead.message && (
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 italic">
                        &ldquo;{lead.message}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 sm:items-end">
                    <Button size="sm" className="h-8 text-xs">Reply</Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">Mark Done</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "blue" | "indigo" | "amber" | "emerald";
}) {
  const colors = {
    blue:    "bg-blue-50 text-blue-700",
    indigo:  "bg-indigo-50 text-indigo-700",
    amber:   "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-card">
      <div className={cn("mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg", colors[color])}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
