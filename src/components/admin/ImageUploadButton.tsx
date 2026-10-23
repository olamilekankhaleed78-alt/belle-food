"use client";

import { useState } from "react";

type ImageUploadButtonProps = {
  onUploaded: (url: string) => void;
};

export function ImageUploadButton({ onUploaded }: ImageUploadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function upload(file: File) {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as { url?: string };
    if (result.url) onUploaded(result.url);
    setLoading(false);
  }

  return (
    <label className="block cursor-pointer border border-dashed border-[#2d2d2d] p-4 text-center text-xs uppercase tracking-[0.12em] text-zinc-300 hover:border-white">
      {loading ? "Uploading..." : "Drag & Drop / Click to Upload"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </label>
  );
}
