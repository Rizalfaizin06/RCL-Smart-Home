"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";

export default function ScheduleSheet({
  onClose,
  deviceId: initialDeviceId,
  lockDevice = false,
}: {
  onClose: () => void;
  deviceId?: number;
  lockDevice?: boolean;
}) {
  const { devices, addSchedule } = useStore();
  const [deviceId, setDeviceId] = useState(
    initialDeviceId ?? devices[0]?.id ?? 0,
  );
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [status, setStatus] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return setError("Please select a device.");
    setError("");
    setSubmitting(true);
    try {
      await addSchedule({
        device_id: device.id,
        hour,
        minute,
        second: 0,
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schedule.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-t-[var(--radius-card)] bg-surface p-6 sm:rounded-[var(--radius-card)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New schedule</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="device">Device</Label>
            <Select
              id="device"
              value={deviceId}
              onChange={(e) => setDeviceId(Number(e.target.value))}
              disabled={lockDevice}
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Time</Label>
            <div className="flex items-center gap-2">
              <Select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                aria-label="Hour"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </Select>
              <span className="text-xl font-semibold text-muted">:</span>
              <Select
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                aria-label="Minute"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3.5">
            <div>
              <p className="text-sm font-medium">Action</p>
              <p className="text-xs text-muted">
                Turn the device {status ? "on" : "off"} at this time
              </p>
            </div>
            <Toggle checked={status} onChange={setStatus} ariaLabel="Action" />
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create schedule"}
          </Button>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
