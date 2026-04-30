"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, MapPin, Menu, Search, X, LogOut, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState("");
  const { isSignedIn, user }        = useUser();
  const { signOut }                 = useClerk();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "liatmorr@gmail.com";

  function handleSearch() {
    if (!searchVal.trim()) return;
    router.push(`/results?q=${encodeURIComponent(searchVal.trim())}`);
    setSearchOpen(false);
    setSearchVal("");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-slate-900">Shul</span><span className="text-[#0ea5e9]">Search</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/results" active={pathname === "/results"}>
              <MapPin className="h-3.5 w-3.5" /> Browse
            </NavLink>

            {/* Expandable search */}
            {searchOpen ? (
              <div className="flex items-center gap-1 rounded-lg border border-blue-400 bg-white px-2 ring-1 ring-blue-400">
                <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); if (e.key === "Escape") setSearchOpen(false); }}
                  placeholder="City, zip, or place name…"
                  className="w-52 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
                />
                <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[var(--accent)] hover:text-slate-900 transition-colors"
              >
                <Search className="h-3.5 w-3.5" /> Search
              </button>
            )}

            <NavLink href="/favorites" active={pathname === "/favorites"}>
              <Heart className="h-3.5 w-3.5" /> Saved
            </NavLink>
            {isAdmin && (
              <NavLink href="/admin" active={pathname.startsWith("/admin")}>
                Admin
              </NavLink>
            )}
          </nav>

          {/* Auth — signed out */}
          {!isSignedIn && (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Auth — signed in (desktop) */}
          {isSignedIn && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt={user.firstName ?? ""}
                    className="h-8 w-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                    {user?.firstName?.[0] ?? "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700">
                  {user?.firstName ?? "Account"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-slate-500 hover:text-red-600"
                onClick={() => signOut({ redirectUrl: "/" })}
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          )}

          {/* Mobile: auth avatar + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {isSignedIn && (
              user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                  {user?.firstName?.[0] ?? "U"}
                </div>
              )
            )}
            <button
              className="p-2 rounded-lg hover:bg-[var(--accent)]"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile top tab row */}
        <nav className="md:hidden flex border-t border-[var(--border)]">
          <TopTab href="/results" icon={<LayoutGrid className="h-4 w-4" />} label="Browse" active={pathname === "/results"} />
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors border-b-2",
              searchOpen ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-slate-500"
            )}
          >
            <Search className="h-4 w-4" /> Search
          </button>
          <TopTab href="/favorites" icon={<Heart className="h-4 w-4" />} label="Saved" active={pathname === "/favorites"} />
        </nav>

        {/* Mobile search bar — slides in below tabs */}
        {searchOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-white px-3 py-2 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="City, zip, or place name…"
                className="h-9 w-full rounded-lg border border-[var(--border)] pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Go
            </button>
          </div>
        )}

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-white px-4 pb-4 pt-2">
            {isSignedIn && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-slate-100">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    {user?.firstName?.[0] ?? "U"}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-slate-500">{user?.primaryEmailAddress?.emailAddress}</div>
                </div>
              </div>
            )}
            <nav className="flex flex-col gap-1">
              {isAdmin && (
                <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>
                  Admin
                </MobileNavLink>
              )}
              {!isSignedIn ? (
                <>
                  <MobileNavLink href="/sign-in" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </MobileNavLink>
                  <MobileNavLink href="/sign-up" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </MobileNavLink>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); signOut({ redirectUrl: "/" }); }}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 text-left flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

    </>
  );
}

function TopTab({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors border-b-2",
        active ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-slate-500"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-blue-50 text-[var(--primary)]" : "text-slate-600 hover:bg-[var(--accent)] hover:text-slate-900"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[var(--accent)]">
      {children}
    </Link>
  );
}
