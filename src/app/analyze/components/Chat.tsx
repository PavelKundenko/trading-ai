"use client";

import type { LocalPreview } from '@/app/analyze/page';

type ChatProps = {
  onReset: () => void;
};

export default function Chat({ onReset }: ChatProps) {
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
              {"Analyzing..."}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


