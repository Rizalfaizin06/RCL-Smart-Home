"use client";

import { cn } from "@/lib/utils";
import type { Room } from "@/lib/types";
import RoomIcon from "./ui/RoomIcon";

interface RoomChipsProps {
  rooms: Room[];
  selected: number | "all";
  onSelect: (id: number | "all") => void;
}

export default function RoomChips({ rooms, selected, onSelect }: RoomChipsProps) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 md:mx-0 md:px-0 md:flex-wrap">
      <button
        type="button"
        onClick={() => onSelect("all")}
        className="flex shrink-0 flex-col items-center gap-1.5"
      >
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-200",
            selected === "all"
              ? "border-foreground bg-foreground text-accent-foreground"
              : "border-border bg-surface text-muted hover:border-foreground/30",
          )}
        >
          <span className="text-base font-semibold">All</span>
        </span>
      </button>

      {rooms.map((room) => {
        const active = selected === room.id;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-200",
                active
                  ? "border-foreground bg-foreground text-accent-foreground"
                  : "border-border bg-surface text-muted hover:border-foreground/30",
              )}
            >
              <RoomIcon icon={room.icon} className="h-6 w-6" />
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                active ? "text-foreground" : "text-muted-2",
              )}
            >
              {room.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
