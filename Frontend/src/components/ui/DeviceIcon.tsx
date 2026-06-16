import {
  Lightbulb,
  Speaker,
  Thermometer,
  Wifi,
  Tv,
  Plug,
  AirVent,
  Camera,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import type { DeviceType } from "@/lib/types";

const map: Record<DeviceType, LucideIcon> = {
  light: Lightbulb,
  speaker: Speaker,
  thermostat: Thermometer,
  router: Wifi,
  tv: Tv,
  plug: Plug,
  ac: AirVent,
  camera: Camera,
  generic: Cpu,
};

export default function DeviceIcon({
  type = "generic",
  className,
}: {
  type?: DeviceType;
  className?: string;
}) {
  const Icon = map[type] ?? Cpu;
  return <Icon className={className} strokeWidth={1.75} />;
}
