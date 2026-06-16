"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Device } from "@/lib/types";
import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { deviceTypeIconOptions } from "@/components/ui/DeviceIcon";

export default function DeviceForm({ device }: { device?: Device }) {
  const router = useRouter();
  const { rooms, devices, deviceTypes, addDevice, updateDevice } = useStore();
  const isEdit = Boolean(device);

  const [name, setName] = useState(device?.name ?? "");
  const [slot, setSlot] = useState<string>(
    device?.slot !== undefined ? String(device.slot) : "",
  );
  const [typeId, setTypeId] = useState<string>(
    device?.type_id != null ? String(device.type_id) : "",
  );
  const [roomId, setRoomId] = useState<string>(
    device?.room_id != null ? String(device.room_id) : "",
  );
  // Icon is independent of type so a device can show a specific icon.
  const [icon, setIcon] = useState<string>(device?.icon ?? "light");
  const [status, setStatus] = useState(device?.status ?? false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const usedSlots = devices
    .filter((d) => d.id !== device?.id)
    .map((d) => d.slot);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Device name is required.");
    if (slot === "") return setError("Slot number is required.");

    const slotNum = Number(slot);
    if (Number.isNaN(slotNum) || slotNum < 0) {
      return setError("Slot must be a non-negative number.");
    }
    if (usedSlots.includes(slotNum)) {
      return setError(`Slot ${slotNum} is already in use.`);
    }

    const payload = {
      name: name.trim(),
      slot: slotNum,
      status,
      room_id: roomId === "" ? null : Number(roomId),
      type_id: typeId === "" ? null : Number(typeId),
      icon,
    };

    setSubmitting(true);
    try {
      if (isEdit && device) {
        await updateDevice(device.id, payload);
        router.push(`/devices/${device.id}`);
      } else {
        const created = await addDevice(payload);
        router.push(`/devices/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save device.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="name">Device name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Living room light"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="slot">Slot (relay pin)</Label>
          <Input
            id="slot"
            type="number"
            min={0}
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="icon">Icon</Label>
          <Select
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            {deviceTypeIconOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="type">Device type</Label>
        <Select
          id="type"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
        >
          <option value="">No type</option>
          {deviceTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        {deviceTypes.length === 0 && (
          <p className="mt-1.5 text-xs text-muted">
            No types yet.{" "}
            <Link href="/types" className="font-semibold text-foreground">
              Create one
            </Link>
            .
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="room">Room</Label>
        <Select
          id="room"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
        {rooms.length === 0 && (
          <p className="mt-1.5 text-xs text-muted">
            No rooms yet.{" "}
            <Link href="/rooms" className="font-semibold text-foreground">
              Create one
            </Link>
            .
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3.5">
        <div>
          <p className="text-sm font-medium">Initial state</p>
          <p className="text-xs text-muted">Turn the device on by default</p>
        </div>
        <Toggle checked={status} onChange={setStatus} ariaLabel="Initial state" />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Add device"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
