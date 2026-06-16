"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import MobileDrawer from "./MobileDrawer";
import { useStore } from "@/lib/store";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
      <Sidebar />

      <main className="min-w-0 flex-1 pb-24 md:pb-0">
        {/* Shared mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-background/80 px-5 py-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-zinc-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/profile">
            <Image
              src={user.avatarUrl ?? "https://portfolio.rizalscompanylab.my.id/images/avatar/rizal-square.jpg"}
              alt={user.name}
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
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
