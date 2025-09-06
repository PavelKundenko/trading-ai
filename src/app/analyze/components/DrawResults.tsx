"use client";

import { useMemo } from "react";

type TakeProfitLevel = {
  price: number;
  volume_percent: number;
  order_type: "limit" | "market" | string;
};

export type AnalyzeResult = {
  symbol: string;
  timestamp_utc: string;
  timeframe_detected: string;
  signal: "buy" | "sell" | string;
  entry_price: number;
  stop_loss: number;
  take_profit: TakeProfitLevel[];
  order_quantity: number | null;
  order_type: "limit" | "market" | string;
  confidence: number;
  advice: string;
  issues: string[];
};

export default function DrawResults({ data }: { data: AnalyzeResult }) {
  const signalColor = useMemo(() => {
    if (data.signal === "buy") return "text-emerald-300";
    if (data.signal === "sell") return "text-rose-300";
    return "text-zinc-300";
  }, [data.signal]);

  const confidencePercent = Math.round(Math.min(Math.max(data.confidence, 0), 1) * 100);

  return (
    <div className="min-h-screen w-full px-6 py-10 sm:px-10 bg-[radial-gradient(1200px_600px_at_50%_-10%,#052d23_0%,transparent_60%),radial-gradient(800px_400px_at_120%_10%,#0b1220_0%,transparent_60%),radial-gradient(800px_400px_at_-20%_20%,#1b0f28_0%,transparent_60%)] text-foreground">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{data.symbol}</h1>
            <p className="text-sm text-zinc-400">{new Date(data.timestamp_utc).toUTCString()} • {data.timeframe_detected}</p>
          </div>
          <div className={`text-lg font-semibold ${signalColor}`}>{data.signal.toUpperCase()}</div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-5">
            <div className="text-zinc-400 text-xs">Entry</div>
            <div className="text-xl">{data.entry_price}</div>
          </div>
          <div className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-5">
            <div className="text-zinc-400 text-xs">Stop Loss</div>
            <div className="text-xl">{data.stop_loss}</div>
          </div>
          <div className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-5">
            <div className="text-zinc-400 text-xs">Order Type</div>
            <div className="text-xl uppercase">{data.order_type}</div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-zinc-300">Confidence</div>
            <div className="text-sm text-zinc-400">{confidencePercent}%</div>
          </div>
          <div className="h-2 w-full rounded bg-zinc-800 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${confidencePercent}%` }} />
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-5">
          <h2 className="text-sm uppercase tracking-widest text-emerald-300/80 mb-3">Take Profit</h2>
          <ul className="divide-y divide-emerald-800/40">
            {data.take_profit.map((tp, index) => (
              <li key={`${tp.price}-${index}`} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400 text-xs">TP{index + 1}</span>
                  <span className="text-zinc-200">{tp.price}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-400">{tp.volume_percent}%</span>
                  <span className="uppercase text-zinc-300">{tp.order_type}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-5">
          <h2 className="text-sm uppercase tracking-widest text-emerald-300/80 mb-3">Advice</h2>
          <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">{data.advice}</p>
        </section>

        {data.issues && data.issues.length > 0 && (
          <section className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-5">
            <h2 className="text-sm uppercase tracking-widest text-emerald-300/80 mb-3">Issues</h2>
            <ul className="list-disc pl-5 text-sm text-zinc-300">
              {data.issues.map((issue, idx) => (
                <li key={`${idx}-${issue}`}>{issue}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}


