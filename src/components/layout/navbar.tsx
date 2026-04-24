"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MapPin, Menu, Search, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname    = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, user }        = useUser();
  const { signOut }                 = useClerk();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "liatmorr@gmail.com";

  return (
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
          <NavLink href="/results?city=Aventura" active={false}>
            <MapPin className="h-3.5 w-3.5" /> Browse
          </NavLink>
          <NavLink href="/near" active={pathname === "/near"}>
            <Search className="h-3.5 w-3.5" /> Shul Search
          </NavLink>
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

        {/* Auth — signed in */}
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[var(--accent)]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
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
            <MobileNavLink href="/results?city=Aventura" onClick={() => setMobileOpen(false)}>
              Browse Listings
            </MobileNavLink>
            <MobileNavLink href="/near" onClick={() => setMobileOpen(false)}>
              Shul Search
            </MobileNavLink>
            <MobileNavLink href="/favorites" onClick={() => setMobileOpen(false)}>
              Saved
            </MobileNavLink>
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
