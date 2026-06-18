"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Home,
  FileText,
  Coins,
  Users,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  role: string;
  coin_balance: number;
  nim: string | null;
  major: string | null;
  semester_id: number | null;
  avatar_url: string | null;
}

interface AdminSidebarLayoutProps {
  profile: Profile | null;
  userEmail: string;
  children: React.ReactNode;
  logoutAction: () => void;
}

export default function AdminSidebarLayout({
  profile,
  userEmail,
  children,
  logoutAction,
}: AdminSidebarLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin", icon: Home },
    { name: "Verifikasi Catatan", href: "/admin/notes", icon: FileText },
    { name: "Verifikasi Top Up", href: "/admin/topups", icon: Coins },
    { name: "Kelola Pengguna", href: "/admin/users", icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card fixed h-full z-20">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Admin <span className="text-primary">Panel</span>
            </span>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getInitials(profile?.name || "Admin")}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">
                {profile?.name || "Admin"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>

          {/* Badge Mode */}
          <div className="mt-3 flex items-center justify-center gap-1.5 bg-primary/5 border border-primary/10 rounded-xl py-2 text-primary text-xs font-bold">
            <Shield className="h-4 w-4" />
            <span>Admin Mode</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/5 text-primary border-l-4 border-primary pl-3 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{item.name}</span>
                </div>
                {active && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ke Dashboard</span>
          </Link>
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative flex flex-col w-64 max-w-xs bg-card border-r border-border h-full p-4 shadow-xl z-10 transition-transform duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-md font-bold tracking-tight text-foreground">
                  Admin Panel
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile info in mobile menu */}
            <div className="py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(profile?.name || "Admin")}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">
                    {profile?.name || "Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 bg-primary/5 border border-primary/10 rounded-xl py-2 text-primary text-xs font-bold">
                <Shield className="h-4 w-4" />
                <span>Admin Mode</span>
              </div>
            </div>

            {/* Nav list */}
            <nav className="flex-1 py-4 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/5 text-primary border-l-4 border-primary pl-3 font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom items */}
            <div className="border-t border-border pt-4 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Ke Dashboard</span>
              </Link>
              <form action={logoutAction} className="w-full">
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-md font-bold text-foreground md:hidden">
              {pathname === "/admin"
                ? "Overview"
                : pathname === "/admin/notes"
                ? "Verifikasi Catatan"
                : pathname === "/admin/topups"
                ? "Verifikasi Top Up"
                : pathname === "/admin/users"
                ? "Kelola Pengguna"
                : "Admin Panel"}
            </h2>
            <h2 className="text-lg font-bold tracking-tight text-foreground hidden md:block">
              {pathname === "/admin"
                ? "Admin Dashboard Overview"
                : pathname === "/admin/notes"
                ? "Verifikasi Unggahan Catatan"
                : pathname === "/admin/topups"
                ? "Persetujuan Top Up Koin"
                : pathname === "/admin/users"
                ? "Manajemen Pengguna"
                : "Admin Panel"}
            </h2>
          </div>
        </header>

        {/* Content Page wrapper */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
