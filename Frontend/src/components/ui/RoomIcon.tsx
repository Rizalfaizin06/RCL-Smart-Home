import {
  Sofa,
  BedDouble,
  CookingPot,
  Bath,
  Car,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  living: Sofa,
  bedroom: BedDouble,
  kitchen: CookingPot,
  bathroom: Bath,
  garage: Car,
  office: Briefcase,
};

export const roomIconOptions = [
  { value: "living", label: "Living room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "garage", label: "Garage" },
  { value: "office", label: "Office" },
] as const;

export default function RoomIcon({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  const Icon = (icon && map[icon]) || Sofa;
  return <Icon className={className} strokeWidth={1.75} />;
}
