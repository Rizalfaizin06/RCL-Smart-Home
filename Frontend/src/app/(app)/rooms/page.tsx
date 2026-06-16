"use client";

import { useState } from "react";
import { DoorOpen, Pencil, Plus, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Room } from "@/lib/types";
import RoomIcon, { roomIconOptions } from "@/components/ui/RoomIcon";
import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function RoomsPage() {
  const { rooms, devices, loading, addRoom, updateRoom, deleteRoom } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (room: Room) => {
    setEditing(room);
    setSheetOpen(true);
  };

  const deviceCount = (room: Room) =>
    room.deviceCount ?? devices.filter((d) => d.room_id === room.id).length;

  const deleteMessage = (room: Room) => {
    const count = deviceCount(room);
    const extra = count
      ? ` ${count} device${count > 1 ? "s" : ""} will be unassigned.`
      : "";
    return `Delete "${room.name}"?${extra}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} room${rooms.length !== 1 ? "s" : ""}`}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="flex h-11 items-center gap-1.5 rounded-2xl bg-foreground px-4 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        }
      />

      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="h-[72px] animate-pulse rounded-[var(--radius-card)] border border-border bg-surface"
            />
          ))}
        </ul>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center">
          <DoorOpen className="h-8 w-8 text-muted-2" />
          <p className="text-sm text-muted">No rooms yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 pr-4"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100">
                <RoomIcon icon={room.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{room.name}</p>
                <p className="truncate text-xs text-muted">
                  {deviceCount(room)} device{deviceCount(room) !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(room)}
                aria-label={`Edit ${room.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:bg-zinc-100 hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleting(room)}
                aria-label={`Delete ${room.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {sheetOpen && (
        <RoomSheet
          room={editing}
          onClose={() => setSheetOpen(false)}
          onSave={async (name, icon) => {
            if (editing) {
              await updateRoom(editing.id, { name, icon });
            } else {
              await addRoom({ name, icon });
            }
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete room"
          message={deleteMessage(deleting)}
          confirmLabel="Delete"
          destructive
          onConfirm={() => deleteRoom(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function RoomSheet({
  room,
  onClose,
  onSave,
}: {
  room: Room | null;
  onClose: () => void;
  onSave: (name: string, icon: string) => Promise<void>;
}) {
  const [name, setName] = useState(room?.name ?? "");
  const [icon, setIcon] = useState(room?.icon ?? "living");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Room name is required.");
    setError("");
    setSubmitting(true);
    try {
      await onSave(name.trim(), icon);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save room.");
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
          <h2 className="text-lg font-semibold">
            {room ? "Edit room" : "New room"}
          </h2>
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
            <Label htmlFor="room-name">Name</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Living room"
            />
          </div>

          <div>
            <Label htmlFor="room-icon">Icon</Label>
            <Select
              id="room-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            >
              {roomIconOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : room ? "Save changes" : "Create room"}
          </Button>
        </form>
      </div>
    </div>
  );
}
