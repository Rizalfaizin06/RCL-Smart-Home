import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-foreground text-accent-foreground hover:bg-zinc-800 active:scale-[0.99]",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-zinc-100",
  ghost: "text-muted hover:bg-zinc-100 hover:text-foreground",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const base =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-semibold transition-all duration-150 disabled:opacity-50";

export function Button({
  variant = "primary",
  className,
  ...props
}: { variant?: Variant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: { variant?: Variant } & React.ComponentProps<typeof Link>) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
}
