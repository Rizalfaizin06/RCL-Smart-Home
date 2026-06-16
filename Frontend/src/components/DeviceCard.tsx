"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Pencil } from "lucide-react";
import type { Device } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import DeviceIcon from "./ui/DeviceIcon";

export default function DeviceCard({ device }: { device: Device }) {
  const router = useRouter();
  const { toggleDevice } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const on = device.status;
  const iconKey = device.icon ?? device.type?.icon ?? "generic";

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={on}
      onClick={() => void toggleDevice(device.id).catch(() => {})}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void toggleDevice(device.id).catch(() => {});
        }
      }}
      className={cn(
        "group relative flex aspect-square cursor-pointer flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border p-4 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-foreground/30 sm:p-5",
        on
          ? "border-foreground bg-foreground text-accent-foreground"
          : "border-border bg-surface text-foreground hover:border-foreground/30",
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl transition-colors",
            on ? "bg-white/15 text-white" : "bg-zinc-100 text-foreground",
          )}
        >
          <DeviceIcon type={iconKey} className="h-5 w-5" />
        </span>

        {/* Kebab menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Device options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={cn(
              "-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              on
                ? "text-white/70 hover:bg-white/15"
                : "text-muted hover:bg-zinc-100",
            )}
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-2xl border border-border bg-surface py-1 text-foreground shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/devices/${device.id}`);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium hover:bg-zinc-100"
              >
                <Eye className="h-4 w-4 text-muted" />
                View detail
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/devices/${device.id}/edit`);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium hover:bg-zinc-100"
              >
                <Pencil className="h-4 w-4 text-muted" />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="text-[15px] font-semibold leading-tight">{device.name}</p>
        <p className={cn("mt-0.5 text-xs", on ? "text-white/60" : "text-muted")}>
          {on ? "On" : "Off"}
        </p>
      </div>
    </div>
  );
}
