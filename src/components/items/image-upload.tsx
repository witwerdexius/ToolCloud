"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadProps {
  files: File[];
  existingUrls?: string[];
  onChange: (files: File[]) => void;
  onRemoveExisting?: (url: string) => void;
}

export function ImageUpload({
  files,
  existingUrls = [],
  onChange,
  onRemoveExisting,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    onChange([...files, ...valid].slice(0, 5)); // max 5 images total
  }

  function removeNew(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  const totalCount = existingUrls.length + files.length;

  return (
    <div className="space-y-3">
      {/* Vorhandene Bilder */}
      {existingUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingUrls.map((url) => (
            <div key={url} className="relative h-24 w-24">
              <Image
                src={url}
                alt="Vorhandenes Bild"
                fill
                className="rounded-lg object-cover"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Neue Bilder (Vorschau) */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative h-24 w-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop-Zone */}
      {totalCount < 5 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver
              ? "border-emerald-400 bg-emerald-50"
              : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
          }`}
        >
          <p className="text-sm text-gray-500">
            Bilder hierher ziehen oder{" "}
            <span className="text-emerald-600 font-medium">auswählen</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Max. 5 Bilder · JPG, PNG, WebP
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}
