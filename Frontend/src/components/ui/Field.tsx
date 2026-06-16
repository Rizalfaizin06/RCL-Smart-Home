import { cn } from "@/lib/utils";

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-muted-2 focus:border-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full appearance-none rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none transition-colors focus:border-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
