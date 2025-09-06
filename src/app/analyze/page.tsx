"use client";

import { useCallback, useState } from "react";
import UploadImage from "@/app/analyze/components/UploadImage";
import Chat from "@/app/analyze/components/Chat";
import ChartCapture from "@/app/analyze/components/ChartCapture";

export type LocalPreview = {
  id: string;
  file: File;
  url: string;
};

export default function AnalyzePage() {
  const [mode, setMode] = useState<"choice" | "upload" | "chart" | "chat">("choice");
  const [previews, setPreviews] = useState<LocalPreview[]>([]);

  const onUpload = useCallback(
    async (files: File[]) => {
    const selectedFile = files[0];

    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
      await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
    } catch {
      
    }

    setMode("chat");
  }, []);

  const onReset = useCallback(() => {
    setPreviews([]);
    setMode("choice");
  }, []);

  // Sync mode with URL param if present
  // We read from window.location to avoid importing navigation hooks here
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/analyze/")) {
      const raw = path.split("/analyze/")[1];
      const next = raw === "chart" ? "chart" : raw === "upload" ? "upload" : "choice";
      if (next !== mode && mode !== "chat") {
        // Do not override chat mode once active
        setMode(next);
      }
    }
  }
  
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Choice view */}
      <div
        className={
          `absolute inset-0 h-full overflow-y-auto transition-all duration-500 ease-in-out ` +
          (mode === "choice" ? `translate-x-0 opacity-100` : `-translate-x-full opacity-0 pointer-events-none`)
        }
      >
        <div className="min-h-screen w-full px-6 py-10 sm:px-10 bg-[radial-gradient(1200px_600px_at_50%_-10%,#052d23_0%,transparent_60%),radial-gradient(800px_400px_at_120%_10%,#0b1220_0%,transparent_60%),radial-gradient(800px_400px_at_-20%_20%,#1b0f28_0%,transparent_60%)] text-foreground">
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <header className="flex flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Analyze</h1>
              <p className="text-sm text-zinc-400">Choose how you want to provide a chart.</p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("upload")}
                className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-6 text-left hover:border-emerald-500/60 transition-colors"
              >
                <div className="text-xl font-semibold mb-2">Upload Screenshot</div>
                <div className="text-sm text-zinc-400">Drag & drop, paste, or browse files.</div>
              </button>
              <button
                type="button"
                onClick={() => setMode("chart")}
                className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black p-6 text-left hover:border-emerald-500/60 transition-colors"
              >
                <div className="text-xl font-semibold mb-2">Use Live Chart</div>
                <div className="text-sm text-zinc-400">Open TradingView widget and capture a screenshot.</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload view */}
      <div
        className={
          `absolute inset-0 h-full overflow-y-auto transition-all duration-500 ease-in-out ` +
          (mode === "upload" ? `translate-x-0 opacity-100` : `translate-x-full opacity-0 pointer-events-none`)
        }
      >
        <UploadImage onUpload={onUpload} previews={previews} setPreviews={setPreviews} />
      </div>

      {/* Chart capture view */}
      <div
        className={
          `absolute inset-0 h-full overflow-y-auto transition-all duration-500 ease-in-out ` +
          (mode === "chart" ? `translate-x-0 opacity-100` : `translate-x-full opacity-0 pointer-events-none`)
        }
      >
        <ChartCapture onUpload={onUpload} previews={previews} setPreviews={setPreviews} />
      </div>

      {/* Chat view */}
      <div
        className={
          `absolute inset-0 h-full overflow-y-auto transition-all duration-500 ease-in-out ` +
          (mode === "chat" ? `translate-x-0 opacity-100` : `translate-x-full opacity-0 pointer-events-none`)
        }
      >
        <Chat onReset={onReset} />
      </div>
    </div>
  );
}


