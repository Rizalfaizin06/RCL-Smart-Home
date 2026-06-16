import type { ReactNode } from "react";
import { House } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* Brand panel (desktop) */}
      <div className="relative hidden flex-1 flex-col justify-between bg-foreground p-12 text-accent-foreground md:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <House className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold">SmartHome</span>
        </div>
        <div>
          <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight">
            Your home, in the palm of your hand.
          </h1>
          <p className="mt-4 max-w-sm text-white/60">
            Control lights, schedules, and every connected device from anywhere.
          </p>
        </div>
        <p className="text-sm text-white/40">© 2026 SmartHome</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
