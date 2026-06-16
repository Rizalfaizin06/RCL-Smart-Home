"use client";

import { useEffect, useRef } from "react";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

// Convert http(s) to ws(s)
function getWsUrl(): string {
  return BASE_URL.replace(/^http/, "ws");
}

export interface WsCommandMessage {
  type: "command";
  slot: number;
  status: "true" | "false";
}

export interface WsSyncMessage {
  type: "sync";
  devices: Array<{ slot: number; status: "true" | "false" }>;
}

export type WsMessage = WsCommandMessage | WsSyncMessage;

interface UseWebSocketOptions {
  userId: number | undefined;
  onMessage: (msg: WsMessage) => void;
}

/**
 * Connects to the backend WebSocket, registers with userId (same as ESP32),
 * and calls onMessage whenever a command or sync is received.
 * Automatically reconnects on disconnect.
 */
export function useWebSocket({ userId, onMessage }: UseWebSocketOptions) {
  // Store onMessage in a ref so we can always call the latest callback
  // without triggering reconnects.
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    function connect() {
      if (unmounted) return;

      ws = new WebSocket(getWsUrl());

      ws.onopen = () => {
        // Register with userId, same as ESP32
        ws?.send(JSON.stringify({ type: "register", userId }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          if (data.type === "command" || data.type === "sync") {
            onMessageRef.current(data as WsMessage);
          }
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onclose = () => {
        if (!unmounted) {
          // Reconnect after 3 seconds
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // Prevent reconnect on intentional close
        ws.close();
      }
    };
  }, [userId]);
}
