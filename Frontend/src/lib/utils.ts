export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatTime(hour: number, minute: number, second = 0): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hour)}:${pad(minute)}${second ? `:${pad(second)}` : ""}`;
}

export function formatTime12(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h12)}:${pad(minute)} ${period}`;
}
