"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Device, Schedule, User } from "./types";
import { mockDevices, mockRooms, mockSchedules, mockUser } from "./mock-data";
import type { Room } from "./types";

interface StoreContextValue {
  user: User;
  rooms: Room[];
  devices: Device[];
  schedules: Schedule[];
  toggleDevice: (id: number, status?: boolean) => void;
  addDevice: (device: Omit<Device, "id" | "user_id">) => void;
  updateDevice: (id: number, patch: Partial<Device>) => void;
  deleteDevice: (id: number) => void;
  addSchedule: (schedule: Omit<Schedule, "id" | "jobId">) => void;
  deleteSchedule: (id: number) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User>(mockUser);
  const [rooms] = useState<Room[]>(mockRooms);
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);

  const value = useMemo<StoreContextValue>(
    () => ({
      user,
      rooms,
      devices,
      schedules,
      toggleDevice: (id, status) =>
        setDevices((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, status: status ?? !d.status } : d,
          ),
        ),
      addDevice: (device) =>
        setDevices((prev) => [
          ...prev,
          { ...device, id: Math.max(0, ...prev.map((d) => d.id)) + 1, user_id: user.id },
        ]),
      updateDevice: (id, patch) =>
        setDevices((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        ),
      deleteDevice: (id) =>
        setDevices((prev) => prev.filter((d) => d.id !== id)),
      addSchedule: (schedule) =>
        setSchedules((prev) => [
          ...prev,
          { ...schedule, id: Math.max(0, ...prev.map((s) => s.id)) + 1 },
        ]),
      deleteSchedule: (id) =>
        setSchedules((prev) => prev.filter((s) => s.id !== id)),
    }),
    [user, rooms, devices, schedules],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
