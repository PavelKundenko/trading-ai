"use client";

import { useEffect, useRef, useState } from "react";
import DrawResults, { AnalyzeResult } from "./DrawResults";

type TakeProfitItem = {
  price: number;
  volume_percent: number;
  order_type: string;
};

type AnalysisPayload = {
  symbol: string;
  timestamp_utc?: string;
  timeframe_detected?: string;
  signal?: string;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: TakeProfitItem[];
  order_quantity?: number | null;
  order_type?: string;
  confidence?: number;
  advice?: string;
  issues?: unknown[];
};

function parseJsonSafely(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isTakeProfitItem(value: unknown): value is TakeProfitItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.price === "number" &&
    typeof v.volume_percent === "number" &&
    typeof v.order_type === "string"
  );
}

function isAnalyzeResult(value: unknown): value is AnalyzeResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.symbol !== "string") return false;
  if (typeof v.timestamp_utc !== "string") return false;
  if (typeof v.timeframe_detected !== "string") return false;
  if (typeof v.signal !== "string") return false;
  if (typeof v.entry_price !== "number") return false;
  if (typeof v.stop_loss !== "number") return false;
  if (!Array.isArray(v.take_profit) || !v.take_profit.every(isTakeProfitItem)) return false;
  if (!(typeof v.order_quantity === "number" || v.order_quantity === null)) return false;
  if (typeof v.order_type !== "string") return false;
  if (typeof v.confidence !== "number") return false;
  if (typeof v.advice !== "string") return false;
  if (!Array.isArray(v.issues)) return false;
  return true;
}

type ChatProps = {
  onReset: () => void;
};

export default function Chat({ onReset }: ChatProps) {
  const [messages, setMessages] = useState<string>('');
  const [latestResult, setLatestResult] = useState<AnalyzeResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const textDecoderRef = useRef<TextDecoder | null>(null);
  const bufferRef = useRef<string>("");

  useEffect(() => {
    const startSseConnection = async () => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const response = await fetch("/api/sse", {
        method: "POST",
        headers: {
          Accept: "text/event-stream"
        },
        signal: abortController.signal
      });

      if (!response.body) {
        return;
      }

      textDecoderRef.current = new TextDecoder();
      const reader = response.body.getReader();
      readerRef.current = reader;

      const parseAndDispatch = (chunkText: string) => {
        bufferRef.current += chunkText;
        bufferRef.current = bufferRef.current.replace(/\r\n/g, "\n");

        const parts = bufferRef.current.split("\n\n");
        bufferRef.current = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventType: string | null = null;
          const dataLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim());
            }
          }

          const rawData = dataLines.join("\n");
          let output = rawData.trim();
          try {
            let parsed: unknown = JSON.parse(output);
            if (typeof parsed === "string") {
              try {
                parsed = JSON.parse(parsed);
              } catch {
                // keep as string
              }
            }
            if (parsed && typeof parsed === "object") {
              output = JSON.stringify(parsed, null, 2);
              if (isAnalyzeResult(parsed)) {
                setLatestResult(parsed);
              }
            } else if (typeof parsed === "string") {
              output = parsed;
            }
          } catch {}
          setMessages(output);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const decoder = textDecoderRef.current as TextDecoder;
        const text = decoder.decode(value, { stream: true });
        parseAndDispatch(text);
      }
    };

    startSseConnection().catch(() => {});

    return () => {
      try {
        if (readerRef.current) {
          readerRef.current.releaseLock();
          readerRef.current = null;
        }
      } catch {}
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      } catch {}
    };
  }, []);

  return (
    <div className="min-h-screen w-full px-6 py-10 sm:px-10 bg-[radial-gradient(1200px_600px_at_50%_-10%,#052d23_0%,transparent_60%),radial-gradient(800px_400px_at_120%_10%,#0b1220_0%,transparent_60%),radial-gradient(800px_400px_at_-20%_20%,#1b0f28_0%,transparent_60%)] text-foreground">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Analysis</h1>
            <p className="text-sm text-zinc-400">One-way chat displaying backend analysis.</p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-700/30 px-3 py-1.5 text-emerald-200 hover:bg-emerald-600/40 active:bg-emerald-700/50 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </header>

        <section>
          <div className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-6 sm:p-8">
            <div className="min-h-[320px] whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {messages.length === 0 ? 'Waiting for data...' : messages}
            </div>
          </div>
        </section>

        {latestResult && (
          <section>
            <DrawResults data={latestResult} />
          </section>
        )}
      </div>
    </div>
  );
}


