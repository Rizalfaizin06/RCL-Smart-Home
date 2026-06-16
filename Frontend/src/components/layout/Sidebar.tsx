"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGrid, Cpu, Clock, User, House, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/schedules", label: "Schedules", icon: Clock },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useStore();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
      <div className="flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-accent-foreground">
          <House className="h-5 w-5" strokeWidth={2} />
        </span>
        <span className="text-lg font-semibold tracking-tight">SmartHome</span>
      </div>

      <nav className="mt-8 flex-1">
        <ul className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-accent-foreground"
                      : "text-muted hover:bg-zinc-100 hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Link
        href="/profile"
        className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-zinc-100"
      >
        <Image
          src={user.avatarUrl ?? "https://portfolio.rizalscompanylab.my.id/images/avatar/rizal-square.jpg"}
          alt={user.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
          unoptimized
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
      </Link>

      <Link
        href="/login"
        className="mt-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-zinc-100 hover:text-foreground"
      >
        <LogOut className="h-5 w-5" strokeWidth={2} />
        Log out
      </Link>
    </aside>
  );
}
