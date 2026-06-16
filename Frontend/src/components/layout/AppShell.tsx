"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { House } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useAuth } from "@/lib/auth";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
      <Sidebar />

      <main className="min-w-0 flex-1 pb-24 md:pb-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-background/80 px-5 py-3 backdrop-blur-md md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-accent-foreground">
              <House className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-lg font-semibold tracking-tight">SmartHome</span>
          </Link>
          <Link href="/profile">
            <Image
              src={user?.avatar_url ?? "https://portfolio.rizalscompanylab.my.id/images/avatar/rizal-square.jpg"}
              alt={user?.name ?? "User"}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
              unoptimized
            />
          </Link>
        </header>

        <div className="mx-auto w-full min-w-0 max-w-md px-5 pb-6 pt-2 md:max-w-3xl md:px-8 md:pt-10">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
