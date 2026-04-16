"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white text-sm">
            ✡
          </span>
          <span className="text-[var(--foreground)]">
            Shul<span className="text-[var(--primary)]">Search</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/results?city=Aventura" active={false}>
            <MapPin className="h-3.5 w-3.5" /> Browse
          </NavLink>
          <NavLink href="/favorites" active={pathname === "/favorites"}>
            <Heart className="h-3.5 w-3.5" /> Saved
          </NavLink>
          {/* Admin link — in production gate this by user role */}
          <NavLink href="/admin" active={pathname.startsWith("/admin")}>
            Admin
          </NavLink>
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

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
          <nav className="flex flex-col gap-1">
            <MobileNavLink href="/results?city=Aventura" onClick={() => setMobileOpen(false)}>
              Browse Listings
            </MobileNavLink>
            <MobileNavLink href="/favorites" onClick={() => setMobileOpen(false)}>
              Saved
            </MobileNavLink>
            <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>
              Admin
            </MobileNavLink>
            <MobileNavLink href="/sign-in" onClick={() => setMobileOpen(false)}>
              Sign In
            </MobileNavLink>
            <MobileNavLink href="/sign-up" onClick={() => setMobileOpen(false)}>
              Get Started
            </MobileNavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-blue-50 text-[var(--primary)]"
          : "text-slate-600 hover:bg-[var(--accent)] hover:text-slate-900"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[var(--accent)]"
    >
      {children}
    </Link>
  );
}
