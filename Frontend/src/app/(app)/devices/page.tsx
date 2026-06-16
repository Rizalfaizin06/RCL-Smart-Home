"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import Toggle from "@/components/ui/Toggle";
import DeviceIcon from "@/components/ui/DeviceIcon";

export default function DevicesPage() {
  const { devices, toggleDevice, loading } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Devices</h1>
          <p className="mt-0.5 text-sm text-muted">
            {devices.length} device{devices.length !== 1 ? "s" : ""} connected
          </p>
        </div>
        <Link
          href="/devices/new"
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-foreground px-4 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Add
        </Link>
      </div>

      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className="h-[72px] animate-pulse rounded-[var(--radius-card)] border border-border bg-surface"
            />
          ))}
        </ul>
      ) : devices.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center text-sm text-muted">
          No devices yet. Add your first one.
        </div>
      ) : (
        <ul className="space-y-3">
          {devices.map((device) => (
            <li key={device.id}>
              <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 pr-4">
                <Link
                  href={`/devices/${device.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100">
                    <DeviceIcon
                      type={device.icon ?? device.type?.icon ?? "generic"}
                      className="h-5 w-5"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">
                      {device.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {device.room?.name ?? "Unassigned"} · Slot {device.slot}
                    </p>
                  </div>
                </Link>
                <Toggle
                  checked={device.status}
                  onChange={() => void toggleDevice(device.id).catch(() => {})}
                  ariaLabel={`Toggle ${device.name}`}
                />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-2" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
