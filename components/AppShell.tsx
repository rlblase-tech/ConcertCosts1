"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Music2,
  PlusCircle,
  ListMusic,
  Users,
} from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Add Concert", icon: PlusCircle },
  { href: "/concerts", label: "My Concerts", icon: ListMusic },
  { href: "/scores", label: "Community scores", icon: Users },
] as const;

type Props = {
  user: User;
  children: React.ReactNode;
};

export function AppShell({ user, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-photo-bg min-h-screen">
      <header className="navbar bg-base-100/90 backdrop-blur-md shadow-sm border-b border-base-300 px-4 lg:px-8 gap-2 flex-wrap min-h-16">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content">
            <Music2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
              Concert Cost Tracker
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 truncate">
              Track shows, spend, and fun in one place
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ThemeSelector compact />
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs text-base-content/50">Signed in</span>
            <span className="text-sm font-medium max-w-[12rem] truncate">
              {user.email}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm gap-1"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <div className="bg-base-100/85 backdrop-blur-md border-b border-base-300 px-2 sm:px-6">
        <nav className="tabs tabs-boxed bg-transparent gap-1 py-2 overflow-x-auto flex-nowrap">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`tab gap-2 shrink-0 ${active ? "tab-active !bg-primary !text-primary-content" : ""}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-white/20 bg-base-100/25 backdrop-blur-md p-4 sm:p-6 shadow-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
