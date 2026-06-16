import type { Device, Room, Schedule, User } from "./types";

// Placeholder data used until the API is wired up.

export const mockUser: User = {
  id: 1,
  name: "Rizal Faizin Firdaus",
  email: "rizal@rcl.my.id",
  avatarUrl: "https://portfolio.rizalscompanylab.my.id/images/avatar/rizal-square.jpg?img=12",
  created_at: "2024-06-17T08:00:00.000Z",
};

export const mockRooms: Room[] = [
  { id: "living", name: "Living room", icon: "living" },
  { id: "bedroom", name: "Bedroom", icon: "bedroom" },
  { id: "kitchen", name: "Kitchen", icon: "kitchen" },
  { id: "bathroom", name: "Bathroom", icon: "bathroom" },
  { id: "garage", name: "Garage", icon: "garage" },
  { id: "office", name: "Office", icon: "office" },
];

export const mockDevices: Device[] = [
  {
    id: 1,
    user_id: 1,
    name: "Smart speaker",
    slot: 0,
    status: true,
    room: "living",
    type: "speaker",
  },
  {
    id: 2,
    user_id: 1,
    name: "Thermostat",
    slot: 1,
    status: false,
    room: "living",
    type: "thermostat",
  },
  {
    id: 3,
    user_id: 1,
    name: "Smart Light",
    slot: 2,
    status: true,
    room: "living",
    type: "light",
  },
  {
    id: 4,
    user_id: 1,
    name: "WiFi Router",
    slot: 3,
    status: true,
    room: "living",
    type: "router",
  },
  {
    id: 5,
    user_id: 1,
    name: "Bedroom Lamp",
    slot: 4,
    status: false,
    room: "bedroom",
    type: "light",
  },
  {
    id: 6,
    user_id: 1,
    name: "Smart TV",
    slot: 5,
    status: false,
    room: "bedroom",
    type: "tv",
  },
  {
    id: 7,
    user_id: 1,
    name: "Coffee Maker",
    slot: 6,
    status: false,
    room: "kitchen",
    type: "plug",
  },
  {
    id: 8,
    user_id: 1,
    name: "Air Conditioner",
    slot: 7,
    status: true,
    room: "bedroom",
    type: "ac",
  },
];

export const mockSchedules: Schedule[] = [
  {
    id: 1,
    jobId: "1",
    device_id: 3,
    device: "Smart Light",
    slot: 2,
    hour: 18,
    minute: 0,
    second: 0,
    status: true,
    nextRun: "Today 18:00",
  },
  {
    id: 2,
    jobId: "2",
    device_id: 3,
    device: "Smart Light",
    slot: 2,
    hour: 23,
    minute: 30,
    second: 0,
    status: false,
    nextRun: "Today 23:30",
  },
  {
    id: 3,
    jobId: "3",
    device_id: 7,
    device: "Coffee Maker",
    slot: 6,
    hour: 6,
    minute: 30,
    second: 0,
    status: true,
    nextRun: "Tomorrow 06:30",
  },
];
