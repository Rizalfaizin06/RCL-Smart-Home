"use client";

import { useState } from "react";
import { Clock, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTime12 } from "@/lib/utils";
import ScheduleSheet from "@/components/ScheduleSheet";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Schedule } from "@/lib/types";

export default function SchedulesPage() {
  const { schedules, deleteSchedule } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<Schedule | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
          <p className="mt-0.5 text-sm text-muted">
            {schedules.length} active automation
            {schedules.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-foreground px-4 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center">
          <Clock className="h-8 w-8 text-muted-2" />
          <p className="text-sm text-muted">No schedules yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {schedules.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
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
                <p className="truncate text-[15px] font-semibold">{s.device}</p>
                <p className="text-xs text-muted">
                  Turn {s.status ? "on" : "off"} ·{" "}
                  {s.nextRun ?? formatTime12(s.hour, s.minute)}
                </p>
              </div>
              <span className="text-lg font-semibold tabular-nums">
                {formatTime12(s.hour, s.minute)}
              </span>
              <button
                type="button"
                onClick={() => setDeleting(s)}
                aria-label="Delete schedule"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {sheetOpen && <ScheduleSheet onClose={() => setSheetOpen(false)} />}

      {deleting && (
        <ConfirmDialog
          title="Delete schedule"
          message={`Delete the schedule for "${deleting.device ?? "this device"}" at ${formatTime12(deleting.hour, deleting.minute)}?`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => deleteSchedule(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
