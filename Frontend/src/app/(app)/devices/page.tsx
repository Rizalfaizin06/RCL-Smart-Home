"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import Toggle from "@/components/ui/Toggle";
import DeviceIcon from "@/components/ui/DeviceIcon";

export default function DevicesPage() {
  const { devices, toggleDevice, rooms } = useStore();

  const roomName = (id?: string) =>
    rooms.find((r) => r.id === id)?.name ?? "Unassigned";

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

      <ul className="space-y-3">
        {devices.map((device) => (
          <li key={device.id}>
            <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 pr-4">
              <Link
                href={`/devices/${device.id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100">
                  <DeviceIcon type={device.type} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">
                    {device.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {roomName(device.room)} · Slot {device.slot}
                  </p>
                </div>
              </Link>
              <Toggle
                checked={device.status}
                onChange={() => toggleDevice(device.id)}
                ariaLabel={`Toggle ${device.name}`}
              />
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-2" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
