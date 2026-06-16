"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Device, DeviceType, Room, Schedule } from "./types";
import {
  deviceApi,
  deviceTypeApi,
  roomApi,
  scheduleApi,
} from "./api";
import { useAuth } from "./auth";
import { useWebSocket, type WsMessage } from "./useWebSocket";

interface StoreContextValue {
  rooms: Room[];
  devices: Device[];
  schedules: Schedule[];
  deviceTypes: DeviceType[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  toggleDevice: (id: number, status?: boolean) => Promise<void>;
  addDevice: (body: {
    name: string;
    slot: number;
    status?: boolean;
    room_id?: number | null;
    type_id?: number | null;
    icon?: string | null;
  }) => Promise<Device>;
  updateDevice: (
    id: number,
    patch: Partial<{
      name: string;
      slot: number;
      status: boolean;
      room_id: number | null;
      type_id: number | null;
      icon: string | null;
    }>,
  ) => Promise<Device>;
  deleteDevice: (id: number) => Promise<void>;

  addSchedule: (body: {
    device_id: number;
    hour: number;
    minute: number;
    second: number;
    status: boolean;
  }) => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;

  addRoom: (body: { name: string; icon?: string }) => Promise<Room>;
  updateRoom: (id: number, patch: { name?: string; icon?: string }) => Promise<Room>;
  deleteRoom: (id: number) => Promise<void>;

  addDeviceType: (body: { name: string; icon?: string }) => Promise<DeviceType>;
  updateDeviceType: (
    id: number,
    patch: { name?: string; icon?: string },
  ) => Promise<DeviceType>;
  deleteDeviceType: (id: number) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [d, r, s, t] = await Promise.all([
        deviceApi.list(),
        roomApi.list(),
        scheduleApi.list(),
        deviceTypeApi.list(),
      ]);
      setDevices(d);
      setRooms(r);
      setSchedules(s);
      setDeviceTypes(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Defer to a microtask so we don't call setState synchronously in the
    // effect body (avoids cascading renders).
    Promise.resolve().then(() => {
      if (user) {
        refresh();
      } else {
        setDevices([]);
        setRooms([]);
        setSchedules([]);
        setDeviceTypes([]);
        setLoading(false);
      }
    });
  }, [user, refresh]);

  // ========== WebSocket: real-time status updates ==========
  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === "command") {
      const newStatus = msg.status === "true";
      setDevices((prev) =>
        prev.map((d) =>
          d.slot === msg.slot ? { ...d, status: newStatus } : d,
        ),
      );
    } else if (msg.type === "sync") {
      setDevices((prev) =>
        prev.map((d) => {
          const synced = msg.devices.find((s) => s.slot === d.slot);
          if (synced) {
            return { ...d, status: synced.status === "true" };
          }
          return d;
        }),
      );
    }
  }, []);

  useWebSocket({ userId: user?.id, onMessage: handleWsMessage });

  const toggleDevice = useCallback(
    async (id: number, status?: boolean) => {
      const current = devices.find((d) => d.id === id);
      const next = status ?? !(current?.status ?? false);
      // optimistic update
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: next } : d)),
      );
      try {
        const updated = await deviceApi.setStatus(id, next);
        setDevices((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: updated.status } : d)),
        );
      } catch (e) {
        // rollback on failure
        setDevices((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, status: current?.status ?? false } : d,
          ),
        );
        throw e;
      }
    },
    [devices],
  );

  const addDevice = useCallback<StoreContextValue["addDevice"]>(async (body) => {
    const created = await deviceApi.create(body);
    // Re-fetch so nested room/type associations are populated.
    const fresh = await deviceApi.get(created.id).catch(() => created);
    setDevices((prev) => [...prev, fresh]);
    return fresh;
  }, []);

  const updateDevice = useCallback<StoreContextValue["updateDevice"]>(
    async (id, patch) => {
      await deviceApi.update(id, patch);
      const fresh = await deviceApi.get(id);
      setDevices((prev) => prev.map((d) => (d.id === id ? fresh : d)));
      return fresh;
    },
    [],
  );

  const deleteDevice = useCallback(async (id: number) => {
    await deviceApi.remove(id);
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setSchedules((prev) => prev.filter((s) => s.device_id !== id));
  }, []);

  const addSchedule = useCallback<StoreContextValue["addSchedule"]>(
    async (body) => {
      await scheduleApi.create(body);
      // schedule create returns a slightly different shape; refetch list
      const list = await scheduleApi.list();
      setSchedules(list);
    },
    [],
  );

  const deleteSchedule = useCallback(async (id: number) => {
    await scheduleApi.remove(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addRoom = useCallback<StoreContextValue["addRoom"]>(async (body) => {
    const created = await roomApi.create(body);
    setRooms((prev) => [...prev, { ...created, deviceCount: 0 }]);
    return created;
  }, []);

  const updateRoom = useCallback<StoreContextValue["updateRoom"]>(
    async (id, patch) => {
      const updated = await roomApi.update(id, patch);
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
      );
      return updated;
    },
    [],
  );

  const deleteRoom = useCallback(async (id: number) => {
    await roomApi.remove(id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    // Devices in this room have room_id set to null by the backend.
    setDevices((prev) =>
      prev.map((d) =>
        d.room_id === id ? { ...d, room_id: null, room: null } : d,
      ),
    );
  }, []);

  const addDeviceType = useCallback<StoreContextValue["addDeviceType"]>(
    async (body) => {
      const created = await deviceTypeApi.create(body);
      setDeviceTypes((prev) => [...prev, { ...created, deviceCount: 0 }]);
      return created;
    },
    [],
  );

  const updateDeviceType = useCallback<StoreContextValue["updateDeviceType"]>(
    async (id, patch) => {
      const updated = await deviceTypeApi.update(id, patch);
      setDeviceTypes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t)),
      );
      return updated;
    },
    [],
  );

  const deleteDeviceType = useCallback(async (id: number) => {
    await deviceTypeApi.remove(id);
    setDeviceTypes((prev) => prev.filter((t) => t.id !== id));
    setDevices((prev) =>
      prev.map((d) =>
        d.type_id === id ? { ...d, type_id: null, type: null } : d,
      ),
    );
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      rooms,
      devices,
      schedules,
      deviceTypes,
      loading,
      error,
      refresh,
      toggleDevice,
      addDevice,
      updateDevice,
      deleteDevice,
      addSchedule,
      deleteSchedule,
      addRoom,
      updateRoom,
      deleteRoom,
      addDeviceType,
      updateDeviceType,
      deleteDeviceType,
    }),
    [
      rooms,
      devices,
      schedules,
      deviceTypes,
      loading,
      error,
      refresh,
      toggleDevice,
      addDevice,
      updateDevice,
      deleteDevice,
      addSchedule,
      deleteSchedule,
      addRoom,
      updateRoom,
      deleteRoom,
      addDeviceType,
      updateDeviceType,
      deleteDeviceType,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
