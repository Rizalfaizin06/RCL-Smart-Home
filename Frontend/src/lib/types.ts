// Domain types mirror the backend models (see Backend/models)

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  created_at?: string;
}

export interface Device {
  id: number;
  user_id: number;
  name: string;
  slot: number;
  status: boolean;
  // UI-only metadata (not yet provided by the API)
  room?: string;
  type?: DeviceType;
}

export type DeviceType =
  | "light"
  | "speaker"
  | "thermostat"
  | "router"
  | "tv"
  | "plug"
  | "ac"
  | "camera"
  | "generic";

export interface Schedule {
  id: number;
  jobId?: string;
  device_id: number;
  device: string; // device name
  slot: number;
  hour: number;
  minute: number;
  second: number;
  status: boolean;
  nextRun?: string;
}

export interface Room {
  id: string;
  name: string;
  icon: RoomIcon;
}

export type RoomIcon =
  | "living"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "garage"
  | "office";
