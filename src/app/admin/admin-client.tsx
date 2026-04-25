"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Home, MessageSquare, CheckCircle2,
  XCircle, Search, MapPin, ExternalLink,
  RefreshCw, Users, ChevronDown, Save, Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { MockSynagogue } from "@/lib/mock-data";
import { DENOMINATION_LABELS, DENOMINATION_COLORS, formatPrice, cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED" | "LOST";

interface AdminLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  source: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    price: number;
    listingType: "SALE" | "RENT";
  } | null;
  user: { id: string; name: string | null; email: string } | null;
}

interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  savedCount: number;
  leadsCount: number;
  lastLead: string | null;
}

interface AdminClientProps {
  initialProperties: AdminProperty[];
  synagogues: MockSynagogue[];
  leads: AdminLead[];
  users: AdminUser[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "LOST"];

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW:       "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  QUALIFIED: "bg-purple-100 text-purple-800",
  CLOSED:    "bg-emerald-100 text-emerald-800",
  LOST:      "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW:       "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CLOSED:    "Closed",
  LOST:      "Lost",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminClient({ initialProperties, synagogues, leads: initialLeads, users }: AdminClientProps) {
  const [properties, setProperties]   = useState(initialProperties);
  const [leads, setLeads]             = useState(initialLeads);
  const [synSearch, setSynSearch]     = useState("");
  const [propSearch, setPropSearch]   = useState("");
  const [leadSearch, setLeadSearch]   = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [userSearch, setUserSearch]   = useState("");
  const [syncing, setSyncing]         = useState(false);
  const [syncResult, setSyncResult]   = useState<{ totalImported: number; realtor?: { imported: number }; zillow?: { imported: number } } | null>(null);
  const [seedingShuls, setSeedingShuls] = useState(false);
  const [seedResult, setSeedResult]   = useState<string | null>(null);

  // ── Derived lists ─────────────────────────────────────────────

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

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.property?.city ?? "").toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.property?.title ?? "").toLowerCase().includes(leadSearch.toLowerCase());
    const matchesStatus = leadStatusFilter === "ALL" || l.status === leadStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const pendingApproval = properties.filter((p) => !p.isApproved).length;

  // ── Lead counts by status ──────────────────────────────────────

  const leadCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  // ── Property actions ───────────────────────────────────────────

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

  async function seedSynagogues() {
    setSeedingShuls(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/admin/seed-synagogues", { method: "POST" });
      const data = await res.json();
      setSeedResult(data.message);
      if (data.added > 0) window.location.reload();
    } catch {
      setSeedResult("Error — check console");
    } finally {
      setSeedingShuls(false);
    }
  }

  async function runSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync-listings", { method: "POST" });
      if (res.status === 504 || res.status === 502) {
        alert("Sync timed out — the job is too large to run manually on this plan. The automatic cron job runs daily at noon UTC and will keep listings fresh.");
        return;
      }
      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        alert("Sync timed out — the job is too large to run manually on this plan. The automatic cron job runs daily at noon UTC and will keep listings fresh.");
        return;
      }
      if (data.error) {
        alert(`Sync failed: ${data.error}`);
        return;
      }
      setSyncResult(data as { totalImported: number; realtor?: { imported: number }; zillow?: { imported: number } });
      await fetch("/api/admin/properties/approve-all", { method: "POST" });
      window.location.reload();
    } catch (err) {
      alert(`Sync error: ${String(err)}`);
    } finally {
      setSyncing(false);
    }
  }

  // ── Lead actions ───────────────────────────────────────────────

  async function updateLeadStatus(id: string, status: LeadStatus) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  }

  async function saveLeadNotes(id: string, notes: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">Manage synagogues, listings, leads, and users</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {seedResult && (
            <span className="text-sm text-blue-600 font-medium">✡ {seedResult}</span>
          )}
          {syncResult && (
            <span className="text-sm text-emerald-600 font-medium">
              ✓ {syncResult.totalImported ?? 0} imported
            </span>
          )}
          <Button onClick={seedSynagogues} disabled={seedingShuls} variant="outline" className="gap-2">
            <Building2 className={cn("h-4 w-4", seedingShuls && "animate-spin")} />
            {seedingShuls ? "Adding Shuls…" : "Add Davie & Cooper City Shuls"}
          </Button>
          <Button onClick={runSync} disabled={syncing} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
            {syncing ? "Syncing & Approving…" : "Sync & Approve Listings"}
          </Button>
          <Badge variant="destructive" className="text-xs">Admin Only</Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Home}          label="Total Listings"   value={properties.length}  color="blue" />
        <StatCard icon={Building2}     label="Synagogues"       value={synagogues.length}  color="indigo" />
        <StatCard icon={MessageSquare} label="Leads"            value={leads.length}       color="emerald" />
        <StatCard icon={Users}         label="Registered Users" value={users.length}       color="amber" />
      </div>

      <Tabs defaultValue="leads">
        <TabsList className="mb-6 h-auto flex-wrap">
          <TabsTrigger value="leads" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Leads
            {(leadCounts["NEW"] ?? 0) > 0 && (
              <Badge className="text-xs px-1.5 py-0 bg-blue-500 text-white">{leadCounts["NEW"]} new</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Users
            <Badge variant="secondary" className="text-xs px-1.5 py-0">{users.length}</Badge>
          </TabsTrigger>
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
        </TabsList>

        {/* ── Leads / CRM tab ─────────────────────────────────── */}
        <TabsContent value="leads">
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search leads…"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
              />
            </div>
            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLeadStatusFilter("ALL")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  leadStatusFilter === "ALL"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                All ({leads.length})
              </button>
              {LEAD_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setLeadStatusFilter(s)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    leadStatusFilter === s
                      ? cn(STATUS_STYLES[s], "ring-2 ring-offset-1 ring-current")
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {STATUS_LABELS[s]} ({leadCounts[s] ?? 0})
                </button>
              ))}
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
              <p className="text-sm text-slate-400">No leads match your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onStatusChange={(status) => updateLeadStatus(lead.id, status)}
                  onSaveNotes={(notes) => saveLeadNotes(lead.id, notes)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Users tab ────────────────────────────────────────── */}
        <TabsContent value="users">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search users…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <span className="text-sm text-slate-500">{filteredUsers.length} users</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)] bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">Role</th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">Saved</th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">Leads</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Last Activity</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                          {(user.name ?? user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name ?? "—"}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <Badge
                        variant={user.role === "ADMIN" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className="font-medium text-slate-700">{user.savedCount}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className="font-medium text-slate-700">{user.leadsCount}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
                      {user.lastLead
                        ? new Date(user.lastLead).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">No users found.</p>
            )}
          </div>
        </TabsContent>

        {/* ── Properties tab ──────────────────────────────────── */}
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
                        <div className="text-xs text-slate-400">
                          {prop.beds}bd · {prop.baths}ba{prop.sqft ? ` · ${prop.sqft.toLocaleString()} sqft` : ""}
                        </div>
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
                            className={cn(
                              "h-7 px-2 text-xs",
                              prop.isApproved && "text-red-600 border-red-200 hover:bg-red-50"
                            )}
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

        {/* ── Synagogues tab ──────────────────────────────────── */}
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
                      <span className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        DENOMINATION_COLORS[syn.denomination] ?? "bg-gray-100 text-gray-800"
                      )}>
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
      </Tabs>
    </div>
  );
}

// ─── Lead card with inline status + notes ─────────────────────────────────────

function LeadCard({
  lead,
  onStatusChange,
  onSaveNotes,
}: {
  lead: AdminLead;
  onStatusChange: (status: LeadStatus) => void;
  onSaveNotes: (notes: string) => Promise<void>;
}) {
  const [notes, setNotes]     = useState(lead.notes ?? "");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [expanded, setExpanded] = useState(false);

  const status = lead.status as LeadStatus;

  async function handleSaveNotes() {
    setSaving(true);
    await onSaveNotes(notes);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white shadow-card overflow-hidden">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row gap-4 p-5">
        {/* Avatar */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
          {lead.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-900">{lead.name}</span>
              <a href={`mailto:${lead.email}`} className="ml-2 text-sm text-blue-600 hover:underline">{lead.email}</a>
              {lead.phone && <span className="ml-2 text-sm text-slate-500">{lead.phone}</span>}
            </div>
            <span className="text-xs text-slate-400">
              {new Date(lead.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          </div>

          {/* Property link */}
          {lead.property && (
            <Link
              href={`/property/${lead.property.id}`}
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline"
            >
              <Home className="h-3 w-3" />
              {lead.property.title} · {lead.property.city} · {formatPrice(lead.property.price, lead.property.listingType)}
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          )}

          {/* Message */}
          {lead.message && (
            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 italic">
              &ldquo;{lead.message}&rdquo;
            </p>
          )}

          {/* Registered user info */}
          {lead.user && (
            <p className="mt-1.5 text-xs text-slate-400">
              👤 Registered user: {lead.user.name ?? lead.user.email}
            </p>
          )}
        </div>

        {/* Status + expand */}
        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
          {/* Status dropdown */}
          <div className="relative">
            <select
              value={lead.status}
              onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
              className={cn(
                "appearance-none rounded-full pl-3 pr-8 py-1 text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400",
                STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700"
              )}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" />
          </div>

          {/* Source badge */}
          <span className="text-xs text-slate-400 capitalize">
            {(lead.source ?? "request_info").replace(/_/g, " ")}
          </span>

          {/* Expand notes */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
          >
            {expanded ? "▲ Hide notes" : "▼ Add notes"}
          </button>
        </div>
      </div>

      {/* Notes panel */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Internal Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this lead…"
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleSaveNotes}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save Notes"}
            </Button>
            <a
              href={`mailto:${lead.email}?subject=Re: ${encodeURIComponent(lead.property?.title ?? "Your Property Inquiry")}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ✉ Reply by Email
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

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
