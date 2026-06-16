import {
  Sofa,
  BedDouble,
  CookingPot,
  Bath,
  Car,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { RoomIcon as RoomIconType } from "@/lib/types";

const map: Record<RoomIconType, LucideIcon> = {
  living: Sofa,
  bedroom: BedDouble,
  kitchen: CookingPot,
  bathroom: Bath,
  garage: Car,
  office: Briefcase,
};

export default function RoomIcon({
  icon,
  className,
}: {
  icon: RoomIconType;
  className?: string;
}) {
  const Icon = map[icon] ?? Sofa;
  return <Icon className={className} strokeWidth={1.75} />;
}
