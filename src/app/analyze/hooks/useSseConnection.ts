"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SseEventEnvelope = {
  id?: string | null;
  type: string;
  data: string;
  parsedData?: unknown;
  origin?: string;
  timestamp: number;
};

export type UseSseOptions = {
  withCredentials?: boolean;
  eventTypes?: string[];
  autoReconnect?: boolean;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
  parseJson?: boolean;
  maxMessages?: number;
  onOpen?: () => void;
  onMessage?: (event: SseEventEnvelope) => void;
  onError?: (error: Event | Error) => void;
  startOnMount?: boolean;
};

export function useSseConnection(targetUrl: string | null, options?: UseSseOptions) {
  const merged = useMemo(() => ({
    withCredentials: options?.withCredentials ?? false,
    eventTypes: options?.eventTypes ?? [],
    autoReconnect: options?.autoReconnect ?? true,
    reconnectIntervalMs: options?.reconnectIntervalMs ?? 1500,
    maxReconnectAttempts: options?.maxReconnectAttempts ?? 10,
    parseJson: options?.parseJson ?? true,
    maxMessages: options?.maxMessages ?? 1000,
    onOpen: options?.onOpen,
    onMessage: options?.onMessage,
    onError: options?.onError,
    startOnMount: options?.startOnMount ?? true,
  }), [options]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<SseEventEnvelope | null>(null);
  const [messages, setMessages] = useState<SseEventEnvelope[]>([]);
  const [error, setError] = useState<string | null>(null);

  const closeInternal = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (eventSourceRef.current) {
      try { eventSourceRef.current.close(); } catch {}
      eventSourceRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((evt: MessageEvent) => {
    const envelope: SseEventEnvelope = {
      id: (evt as unknown as { lastEventId?: string }).lastEventId,
      type: evt.type || "message",
      data: String(evt.data ?? ""),
      origin: (evt as MessageEvent).origin,
      timestamp: Date.now(),
    };
    if (merged.parseJson) {
      try {
        envelope.parsedData = JSON.parse(envelope.data);
      } catch {
        envelope.parsedData = undefined;
      }
    }
    setLastEvent(envelope);
    setMessages((prev) => {
      const next = [...prev, envelope];
      if (next.length > merged.maxMessages) next.shift();
      return next;
    });
    if (merged.onMessage) merged.onMessage(envelope);
  }, [merged]);

  const start = useCallback(() => {
    if (!targetUrl || eventSourceRef.current) return;
    setIsConnecting(true);
    setError(null);
    const source = new EventSource(targetUrl, { withCredentials: merged.withCredentials });
    eventSourceRef.current = source;

    const types = new Set<string>(["message", ...merged.eventTypes]);
    types.forEach((eventType) => {
      source.addEventListener(eventType, handleMessage as EventListener);
    });

    source.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setIsConnecting(false);
      setIsConnected(true);
      if (merged.onOpen) merged.onOpen();
    };

    source.onerror = (evt: Event) => {
      setIsConnected(false);
      setIsConnecting(false);
      setError("SSE connection error");
      if (merged.onError) merged.onError(evt);
      closeInternal();
      if (merged.autoReconnect && reconnectAttemptsRef.current < merged.maxReconnectAttempts) {
        const attempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempt;
        reconnectTimerRef.current = setTimeout(() => {
          start();
        }, merged.reconnectIntervalMs);
      }
    };
  }, [targetUrl, merged, handleMessage, closeInternal]);

  const stop = useCallback(() => {
    closeInternal();
    setIsConnected(false);
    setIsConnecting(false);
  }, [closeInternal]);

  const reset = useCallback(() => {
    setMessages([]);
    setLastEvent(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!merged.startOnMount) return;
    if (!targetUrl) return;
    start();
    return () => {
      stop();
    };
  }, [targetUrl, merged.startOnMount, start, stop]);

  return {
    isConnected,
    isConnecting,
    error,
    lastEvent,
    messages,
    start,
    stop,
    reset,
  } as const;
}


