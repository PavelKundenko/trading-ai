"use client";

import { Dispatch, SetStateAction } from "react";
import TvChart from "@/app/analyze/components/Chart";
import { LocalPreview } from "@/app/analyze/page";
import UploadImage from "@/app/analyze/components/UploadImage";

export default function ChartCapture({
  previews,
  setPreviews,
  onUpload,
}: {
  previews: LocalPreview[];
  setPreviews: Dispatch<SetStateAction<LocalPreview[]>>;
  onUpload: (files: File[]) => void;
}) {
  return (
    <div className="min-h-screen w-full px-6 py-10 sm:px-10 bg-[radial-gradient(1200px_600px_at_50%_-10%,#052d23_0%,transparent_60%),radial-gradient(800px_400px_at_120%_10%,#0b1220_0%,transparent_60%),radial-gradient(800px_400px_at_-20%_20%,#1b0f28_0%,transparent_60%)] text-foreground">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Chart</h1>
          <p className="text-sm text-zinc-400">Open the chart, then take an OS screenshot and paste or drag it below.</p>
        </header>
        <section>
          <div className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-2">
            <TvChart symbol="BINANCE:BTCUSDT" />
          </div>
        </section>
        <section>
          <UploadImage onUpload={onUpload} previews={previews} setPreviews={setPreviews} variant="embedded" />
        </section>
      </div>
    </div>
  );
}


