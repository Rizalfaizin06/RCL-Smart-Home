"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import Toggle from "@/components/ui/Toggle";
import DeviceIcon from "@/components/ui/DeviceIcon";
import { formatTime12 } from "@/lib/utils";

export default function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { devices, schedules, rooms, toggleDevice, deleteDevice } = useStore();
  const device = devices.find((d) => d.id === Number(id));

  if (!device) return notFound();
  const on = device.status;

  const deviceSchedules = schedules.filter((s) => s.device_id === device.id);
  const roomName =
    rooms.find((r) => r.id === device.room)?.name ?? "Unassigned";

  const handleDelete = () => {
    if (confirm(`Delete "${device.name}"? This cannot be undone.`)) {
      deleteDevice(device.id);
      router.push("/devices");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={device.name}
        subtitle={`${roomName} · Slot ${device.slot}`}
        action={
          <button
            type="button"
            onClick={() => router.push(`/devices/${device.id}/edit`)}
            aria-label="Edit"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-zinc-100"
          >
            <Pencil className="h-4 w-4" />
          </button>
        }
      />

      {/* State card */}
      <div
        className={`flex items-center justify-between rounded-[var(--radius-card)] border p-6 transition-colors ${
          on
            ? "border-foreground bg-foreground text-accent-foreground"
            : "border-border bg-surface text-foreground"
        }`}
      >
        <div className="space-y-3">
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
              on ? "bg-white/15 text-white" : "bg-zinc-100 text-foreground"
            }`}
          >
            <DeviceIcon type={device.type} className="h-8 w-8" />
          </span>
          <div>
            <p className="text-sm opacity-70">Status</p>
            <p className="text-2xl font-semibold">{on ? "On" : "Off"}</p>
          </div>
        </div>
        <Toggle
          checked={on}
          onChange={() => toggleDevice(device.id)}
          size="lg"
          ariaLabel={`Toggle ${device.name}`}
        />
      </div>

      {/* Schedules for this device */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Schedule</h2>
          <Link
            href="/schedules"
            className="flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Link>
        </div>

        {deviceSchedules.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border py-12 text-center">
            <Clock className="h-7 w-7 text-muted-2" />
            <p className="text-sm text-muted">
              No schedule for this device yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {deviceSchedules.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    s.status
                      ? "bg-foreground text-accent-foreground"
                      : "bg-zinc-100 text-foreground"
                  }`}
                >
                  {s.status ? (
                    <Power className="h-5 w-5" />
                  ) : (
                    <PowerOff className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">
                    Turn {s.status ? "on" : "off"}
                  </p>
                  <p className="text-xs text-muted">
                    {s.nextRun ?? "Daily"}
                  </p>
                </div>
                <span className="text-lg font-semibold tabular-nums">
                  {formatTime12(s.hour, s.minute)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Danger zone */}
      <button
        type="button"
        onClick={handleDelete}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-[15px] font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-5 w-5" />
        Delete device
      </button>
    </div>
  );
}
