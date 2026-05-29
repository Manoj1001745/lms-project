"use client";

import { useCallback, useState } from "react";

type ThumbnailDropzoneProps = {
  value: File | null;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
};

export function ThumbnailDropzone({ value, previewUrl, onChange }: ThumbnailDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const displayUrl = value ? URL.createObjectURL(value) : previewUrl;

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      onChange(file);
    },
    [onChange],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`relative rounded-xl border-2 border-dashed p-6 text-center transition ${
        dragActive ? "border-brand-blue bg-brand-blue/10" : "border-slate-700 bg-slate-950"
      }`}
    >
      {displayUrl ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayUrl} alt="Thumbnail preview" className="mx-auto max-h-48 rounded-lg object-cover" />
          <p className="text-sm text-slate-400">{value?.name ?? "Current thumbnail"}</p>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm font-medium text-red-400 hover:text-red-300"
          >
            Remove image
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-200">Drag and drop course thumbnail here</p>
          <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
        </>
      )}
      <label className="mt-4 inline-block cursor-pointer rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
        Browse image
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
    </div>
  );
}
