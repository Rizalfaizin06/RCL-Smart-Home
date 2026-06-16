"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
  disabled?: boolean;
}

const sizes = {
  sm: { track: "h-5 w-9", knob: "h-4 w-4", translate: "translate-x-4" },
  md: { track: "h-7 w-12", knob: "h-6 w-6", translate: "translate-x-5" },
  lg: { track: "h-9 w-16", knob: "h-8 w-8", translate: "translate-x-7" },
};

export default function Toggle({
  checked,
  onChange,
  size = "md",
  ariaLabel,
  disabled,
}: ToggleProps) {
  const s = sizes[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
        s.track,
        checked ? "bg-foreground" : "bg-zinc-200",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "inline-block transform rounded-full bg-white shadow-sm transition-transform duration-300",
          s.knob,
          checked ? s.translate : "translate-x-0",
        )}
      />
    </button>
  );
}
