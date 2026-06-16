// Domain types mirror the backend models (see Backend/models)

export type Role = "user" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  role?: Role;
  created_at?: string;
  updated_at?: string;
}

// Icons are stored as plain strings in the DB. The UI maps known keys to
// lucide icons and falls back to a generic icon for anything else.
export type RoomIcon =
  | "living"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "garage"
  | "office";

export type DeviceTypeIcon =
  | "light"
  | "speaker"
  | "thermostat"
  | "router"
  | "tv"
  | "plug"
  | "ac"
  | "camera"
  | "generic";

export interface Room {
  id: number;
  user_id?: number;
  name: string;
  icon: string;
  deviceCount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DeviceType {
  id: number;
  user_id?: number;
  name: string;
  icon: string;
  deviceCount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Device {
  id: number;
  user_id: number;
  name: string;
  slot: number;
  status: boolean;
  room_id?: number | null;
  type_id?: number | null;
  icon?: string | null;
  // Nested associations returned by the API (Device.findAll includes room/type)
  room?: Room | null;
  type?: DeviceType | null;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  id: number;
  jobId?: string;
  user_id?: number;
  device_id: number;
  device: string | null; // device name (from API)
  slot: number | null;
  hour: number;
  minute: number;
  second: number;
  status: boolean;
  nextRun?: string | null;
}
