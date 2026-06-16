"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Device, DeviceType } from "@/lib/types";
import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";

const deviceTypes: { value: DeviceType; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "speaker", label: "Speaker" },
  { value: "thermostat", label: "Thermostat" },
  { value: "router", label: "Router" },
  { value: "tv", label: "TV" },
  { value: "plug", label: "Smart Plug" },
  { value: "ac", label: "Air Conditioner" },
  { value: "camera", label: "Camera" },
  { value: "generic", label: "Other" },
];

export default function DeviceForm({ device }: { device?: Device }) {
  const router = useRouter();
  const { rooms, devices, addDevice, updateDevice } = useStore();
  const isEdit = Boolean(device);

  const [name, setName] = useState(device?.name ?? "");
  const [slot, setSlot] = useState<string>(
    device?.slot !== undefined ? String(device.slot) : "",
  );
  const [type, setType] = useState<DeviceType>(device?.type ?? "light");
  const [room, setRoom] = useState(device?.room ?? rooms[0]?.id ?? "");
  const [status, setStatus] = useState(device?.status ?? false);
  const [error, setError] = useState("");

  const usedSlots = devices
    .filter((d) => d.id !== device?.id)
    .map((d) => d.slot);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Device name is required.");
    if (slot === "") return setError("Slot number is required.");

    const slotNum = Number(slot);
    if (usedSlots.includes(slotNum)) {
      return setError(`Slot ${slotNum} is already in use.`);
    }

    if (isEdit && device) {
      updateDevice(device.id, { name, slot: slotNum, type, room, status });
      router.push(`/devices/${device.id}`);
    } else {
      addDevice({ name, slot: slotNum, type, room, status });
      router.push("/devices");
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
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as DeviceType)}
          >
            {deviceTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="room">Room</Label>
        <Select id="room" value={room} onChange={(e) => setRoom(e.target.value)}>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
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
        <Button type="submit">{isEdit ? "Save changes" : "Add device"}</Button>
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
