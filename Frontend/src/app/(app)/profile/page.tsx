"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Cpu,
  DoorOpen,
  LogOut,
  Mail,
  Moon,
  Pencil,
  Tag,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import Toggle from "@/components/ui/Toggle";
import { useState } from "react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { devices } = useStore();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="space-y-7">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

      {/* User card */}
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-7 text-center">
        <Image
          src={user?.avatar_url ?? "https://portfolio.rizalscompanylab.my.id/images/avatar/rizal-square.jpg"}
          alt={user?.name ?? "User"}
          width={88}
          height={88}
          className="h-22 w-22 rounded-full object-cover ring-4 ring-zinc-100"
          unoptimized
        />
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted">
            <Mail className="h-3.5 w-3.5" />
            {user?.email}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium">
          <Cpu className="h-3.5 w-3.5" />
          {devices.length} devices connected
        </div>

        <Link
          href="/profile/edit"
          className="mt-2 flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-zinc-100"
        >
          <Pencil className="h-4 w-4" />
          Edit profile
        </Link>
      </div>

      {/* Preferences */}
      <section>
        <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-2">
          Preferences
        </h3>
        <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
          <Row icon={<Bell className="h-5 w-5" />} label="Notifications">
            <Toggle
              checked={notifications}
              onChange={setNotifications}
              size="sm"
              ariaLabel="Notifications"
            />
          </Row>
          <Row icon={<Moon className="h-5 w-5" />} label="Dark mode">
            <Toggle
              checked={darkMode}
              onChange={setDarkMode}
              size="sm"
              ariaLabel="Dark mode"
            />
          </Row>
        </div>
      </section>

      {/* Manage */}
      <section>
        <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-2">
          Manage
        </h3>
        <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
          <LinkRow href="/rooms" icon={<DoorOpen className="h-5 w-5" />} label="Rooms" />
          <LinkRow href="/types" icon={<Tag className="h-5 w-5" />} label="Device types" />
        </div>
      </section>

      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-[15px] font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-5 w-5" />
        Log out
      </button>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-foreground">
        {icon}
      </span>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {children}
    </div>
  );
}

function LinkRow({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link href={href} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-foreground">
        {icon}
      </span>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-2" />
    </Link>
  );
}
