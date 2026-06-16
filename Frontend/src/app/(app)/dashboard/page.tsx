"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import RoomChips from "@/components/RoomChips";
import DeviceCard from "@/components/DeviceCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { rooms, devices, loading, error } = useStore();
  const [room, setRoom] = useState<number | "all">("all");

  const visible =
    room === "all" ? devices : devices.filter((d) => d.room_id === room);
  const activeCount = devices.filter((d) => d.status).length;

  return (
    <div className="space-y-7">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hi {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-muted">
          {activeCount > 0
            ? `${activeCount} device${activeCount > 1 ? "s" : ""} active right now`
            : "Welcome to your smart home"}
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Rooms */}
      {rooms.length > 0 && (
        <RoomChips rooms={rooms} selected={room} onSelect={setRoom} />
      )}

      {/* Devices */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Devices</h2>
          <div className="flex items-center gap-2">
            <Link
              href="/devices/new"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-accent-foreground transition-transform hover:scale-105"
              aria-label="Add device"
            >
              <Plus className="h-5 w-5" />
            </Link>
            <button
              type="button"
              aria-label="More"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-zinc-100"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-[var(--radius-card)] border border-border bg-surface"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center text-sm text-muted">
            No devices in this room yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {visible.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
