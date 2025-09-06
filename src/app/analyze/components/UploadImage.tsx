"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { LocalPreview } from '@/app/analyze/page';
// import DriveButton from '@/app/analyze/components/GoogleDriveButton';

export default function UploadImage({ onUpload, previews, setPreviews, variant = "standalone" }: {
  previews: LocalPreview[];
  setPreviews: Dispatch<SetStateAction<LocalPreview[]>>;
  onUpload: (files: File[]) => void;
  variant?: "standalone" | "embedded";
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const acceptedMimeTypes = useMemo(
    () => ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    []
  );

  const addFiles = useCallback(
    (files: ReadonlyArray<File>) => {
      if (!files || files.length === 0) return;
      const timestamp = Date.now();
      const nextPreviews: LocalPreview[] = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];

        if (!file) continue;

        if (!acceptedMimeTypes.includes(file.type)) continue;

        const url = URL.createObjectURL(file);
        const id = `${file.name}-${file.size}-${timestamp}-${index}`;
        nextPreviews.push({ id, file, url });
      }
      if (nextPreviews.length === 0) return;
      setPreviews((prev) => [...prev, ...nextPreviews]);
    },
    [acceptedMimeTypes, setPreviews]
  );

  const handleFiles = useCallback(
    (filesList: FileList | null) => {
      if (!filesList || filesList.length === 0) return;
      const files: File[] = Array.from(filesList);
      addFiles(files);
    },
    [addFiles]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  // const onBrowseClick = useCallback(() => {
  //   inputRef.current?.click();
  // }, []);

  const onRemove = useCallback((id: string) => {
    setPreviews((prev: LocalPreview[]) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const next = prev.filter((p) => p.id !== id);
      return next;
    });
  }, [setPreviews]);

  const onPaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const items = event.clipboardData?.items;
      if (!items || items.length === 0) return;
      const files: File[] = [];
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        if (item.kind !== "file") continue;
        const file = item.getAsFile();
        if (!file) continue;
        if (!acceptedMimeTypes.includes(file.type)) continue;
        files.push(file);
      }
      if (files.length > 0) {
        event.preventDefault();
        addFiles(files);
      }
    },
    [acceptedMimeTypes, addFiles]
  );

  const dropzoneBorder = isDragging ? "border-emerald-400 bg-emerald-950/20" : "border-emerald-700/40 bg-gradient-to-b from-zinc-900 to-black";

  const onAnalyze = useCallback(() => {
    const files = previews.map((p) => p.file);
    if (files.length === 0) return;
    onUpload(files);
  }, [previews, onUpload]);

  const Dropzone = (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      }}
      onDrop={onDrop}
      onPaste={onPaste}
      tabIndex={0}
      className={`rounded-2xl border ${dropzoneBorder} transition-colors duration-150 p-8 sm:p-10`}
    >
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-400/50 grid place-items-center shadow-[0_0_30px_-10px_rgba(16,185,129,0.6)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-emerald-300">
              <path fillRule="evenodd" d="M11.47 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1-1.06 1.06L12.75 6.31V20.5a.75.75 0 0 1-1.5 0V6.31L4.03 12.53a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium">
            Drag and drop screenshots here
          </p>
          <p className="text-xs text-zinc-400">or paste from clipboard</p>
        </div>
        {/* <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onBrowseClick}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-700/20 px-4 py-2 text-emerald-200 hover:bg-emerald-600/30 active:bg-emerald-700/40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2a5 5 0 0 0-5 5v3H6a4 4 0 0 0 0 8h12a4 4 0 1 0 0-8h-1V7a5 5 0 0 0-5-5Zm-1 11.5V17a1 1 0 1 0 2 0v-3.5h1a1 1 0 1 0 0-2h-1V10a1 1 0 1 0-2 0v1.5h-1a1 1 0 1 0 0 2h1Z" />
            </svg>
            Browse files
          </button>
          <DriveButton />
        </div> */}
        <input
          ref={inputRef}
          type="file"
          accept={acceptedMimeTypes.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );

  const Queue = (
    previews.length > 0 && (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-emerald-300/80">Queue</h2>
          <button
            type="button"
            onClick={onAnalyze}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-700/30 px-3 py-1.5 text-emerald-200 hover:bg-emerald-600/40 active:bg-emerald-700/50 transition-colors cursor-pointer"
          >
            Analyze
          </button>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {previews.map((preview) => (
            <li key={preview.id} className="group relative overflow-hidden rounded-xl border border-emerald-800/40 bg-zinc-900">
              <div className="relative aspect-video">
                <Image
                  src={preview.url}
                  alt={preview.file.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between p-3 text-xs text-zinc-300">
                <span className="truncate max-w-[70%]" title={preview.file.name}>{preview.file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(preview.id)}
                  className="opacity-80 hover:opacity-100 text-rose-300"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  );

  if (variant === "embedded") {
    return (
      <div className="flex flex-col gap-8">
        {Dropzone}
        {Queue}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-6 py-10 sm:px-10 bg-[radial-gradient(1200px_600px_at_50%_-10%,#052d23_0%,transparent_60%),radial-gradient(800px_400px_at_120%_10%,#0b1220_0%,transparent_60%),radial-gradient(800px_400px_at_-20%_20%,#1b0f28_0%,transparent_60%)] text-foreground">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Upload trading screenshots
          </h1>
          <p className="text-sm text-zinc-400">
            Drop PNG, JPG or WEBP images. Maximize edge clarity for better AI parsing.
          </p>
        </header>
        <section>{Dropzone}</section>
        {Queue}
      </div>
    </div>
  );
}