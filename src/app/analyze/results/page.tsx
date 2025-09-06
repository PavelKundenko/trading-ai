"use client";

import DrawResults, { AnalyzeResult } from "@/app/analyze/components/DrawResults";

// Demo fixture until BE is wired
const demo: AnalyzeResult = {
  symbol: "RUNEUSDT",
  timestamp_utc: "2025-09-06T12:30:00Z",
  timeframe_detected: "15m",
  signal: "sell",
  entry_price: 1.183,
  stop_loss: 1.2,
  take_profit: [
    { price: 1.17, volume_percent: 50, order_type: "limit" },
    { price: 1.16, volume_percent: 30, order_type: "limit" },
    { price: 1.15, volume_percent: 20, order_type: "market" },
  ],
  order_quantity: null,
  order_type: "limit",
  confidence: 0.7,
  advice:
    "Place a LIMIT SELL at 1.183; STOP 1.200. Take profit at 1.170/1.160/1.150 (50%/30%/20%). Risk 1.00% of equity if confidence ≥ 0.60, else 0.50% (size = (risk% * equity) / |1.200 - 1.183|). Move stop to breakeven after TP1, trail 0.5% after TP2, cancel if not filled within 3×15m candles, and close by end of day UTC.",
  issues: [],
};

export default function ResultsPage() {
  return <DrawResults data={demo} />;
}


