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

const map: Record<string, LucideIcon> = {
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

export const deviceTypeIconOptions = [
  { value: "light", label: "Light" },
  { value: "speaker", label: "Speaker" },
  { value: "thermostat", label: "Thermostat" },
  { value: "router", label: "Router" },
  { value: "tv", label: "TV" },
  { value: "plug", label: "Smart Plug" },
  { value: "ac", label: "Air Conditioner" },
  { value: "camera", label: "Camera" },
  { value: "generic", label: "Other" },
] as const;

export default function DeviceIcon({
  type = "generic",
  className,
}: {
  type?: string | null;
  className?: string;
}) {
  const Icon = (type && map[type]) || Cpu;
  return <Icon className={className} strokeWidth={1.75} />;
}
