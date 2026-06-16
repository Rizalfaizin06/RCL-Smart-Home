import type {
  Device,
  DeviceType,
  Room,
  Schedule,
  User,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

const TOKEN_KEY = "smarthome_token";

// ========== Token storage (client-side only) ==========

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

// ========== Core request helper ==========

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach Authorization header (default true)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?", 0);
  }

  // 401 -> token invalid/expired: clear it so guards can redirect.
  if (res.status === 401) {
    clearToken();
  }

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
    ) {
      message = (payload as { message: string }).message;
    }
    throw new ApiError(message, res.status);
  }

  return payload as T;
}

// Most endpoints wrap the result as { message, data }. Unwrap to data.
async function requestData<T>(path: string, options?: RequestOptions): Promise<T> {
  const res = await request<{ data: T }>(path, options);
  return res.data;
}

// ========== Auth ==========

export interface AuthResponse {
  message: string;
  data: User;
  token: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),

  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    }),

  getProfile: () => requestData<User>("/auth/profile"),

  updateProfile: (patch: Partial<Pick<User, "name" | "email" | "avatar_url">> & { password?: string }) =>
    requestData<User>("/auth/profile", { method: "PUT", body: patch }),
};

// ========== Devices ==========

export const deviceApi = {
  list: () => requestData<Device[]>("/devices"),

  get: (id: number) => requestData<Device>(`/devices/${id}`),

  create: (body: {
    name: string;
    slot: number;
    status?: boolean;
    room_id?: number | null;
    type_id?: number | null;
    icon?: string | null;
  }) => requestData<Device>("/devices", { method: "POST", body }),

  update: (
    id: number,
    body: Partial<{
      name: string;
      slot: number;
      status: boolean;
      room_id: number | null;
      type_id: number | null;
      icon: string | null;
    }>,
  ) => requestData<Device>(`/devices/${id}`, { method: "PUT", body }),

  remove: (id: number) => requestData<Device>(`/devices/${id}`, { method: "DELETE" }),

  // Toggle relay + broadcast to ESP32 over WebSocket
  setStatus: (deviceId: number, status: boolean) =>
    requestData<Device>("/devices/status", {
      method: "POST",
      body: { deviceId, status },
    }),
};

// ========== Schedules ==========

export const scheduleApi = {
  list: () => requestData<Schedule[]>("/schedules"),

  create: (body: {
    device_id: number;
    hour: number;
    minute: number;
    second: number;
    status: boolean;
  }) => requestData<Schedule>("/schedules", { method: "POST", body }),

  update: (
    id: number,
    body: Partial<{ hour: number; minute: number; second: number; status: boolean }>,
  ) => requestData<Schedule>(`/schedules/${id}`, { method: "PUT", body }),

  remove: (id: number) => requestData<Schedule>(`/schedules/${id}`, { method: "DELETE" }),
};

// ========== Rooms ==========

export const roomApi = {
  list: () => requestData<Room[]>("/rooms"),

  get: (id: number) => requestData<Room>(`/rooms/${id}`),

  create: (body: { name: string; icon?: string }) =>
    requestData<Room>("/rooms", { method: "POST", body }),

  update: (id: number, body: Partial<{ name: string; icon: string }>) =>
    requestData<Room>(`/rooms/${id}`, { method: "PUT", body }),

  remove: (id: number) => requestData<Room>(`/rooms/${id}`, { method: "DELETE" }),
};

// ========== Device types ==========

export const deviceTypeApi = {
  list: () => requestData<DeviceType[]>("/device-types"),

  get: (id: number) => requestData<DeviceType>(`/device-types/${id}`),

  create: (body: { name: string; icon?: string }) =>
    requestData<DeviceType>("/device-types", { method: "POST", body }),

  update: (id: number, body: Partial<{ name: string; icon: string }>) =>
    requestData<DeviceType>(`/device-types/${id}`, { method: "PUT", body }),

  remove: (id: number) => requestData<DeviceType>(`/device-types/${id}`, { method: "DELETE" }),
};
