import React, { useRef, useState } from "react";
import api from "@/lib/api";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Resolves an upload URL to an absolute serveable URL.
 * Backend returns relative "/api/files/<id>" — prepend REACT_APP_BACKEND_URL.
 */
export function resolveImageUrl(url) {
  if (!url) return url;
  if (url.startsWith("/api/")) return `${BACKEND_URL}${url}`;
  return url;
}

/**
 * ImageUploader
 * - props: value (string URL), onChange(url), label, multiple=false
 * - If multiple: value is array of URLs, onChange(array)
 */
export default function ImageUploader({ value, onChange, label = "Image", multiple = false, testid = "uploader" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadOne = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post("/admin/uploads", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = [];
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) {
          toast.error(`Skipped (not an image): ${f.name}`);
          continue;
        }
        try {
          const u = await uploadOne(f);
          urls.push(u);
        } catch (e) {
          toast.error(`Upload failed: ${f.name}`);
        }
      }
      if (urls.length === 0) return;
      if (multiple) {
        const next = Array.isArray(value) ? [...value, ...urls] : urls;
        onChange(next);
      } else {
        onChange(urls[0]);
      }
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded.`);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const items = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  const removeOne = (idx) => {
    if (multiple) {
      const next = items.filter((_, i) => i !== idx);
      onChange(next);
    } else {
      onChange("");
    }
  };

  return (
    <div data-testid={testid}>
      <label className="overline text-stone-500">{label}</label>

      {/* Preview */}
      {items.length > 0 && (
        <div className={`mt-2 grid ${multiple ? "grid-cols-3" : "grid-cols-1"} gap-2`}>
          {items.map((u, i) => (
            <div key={u + i} className="relative aspect-[4/3] bg-stone-100 border border-stone-200 overflow-hidden group">
              <img src={resolveImageUrl(u)} alt="upload" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeOne(i)}
                data-testid={`${testid}-remove-${i}`}
                className="absolute top-1 right-1 bg-stone-900/80 text-stone-50 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        data-testid={`${testid}-dropzone`}
        className={`mt-2 cursor-pointer border-2 border-dashed transition-colors ${
          dragging ? "border-stone-900 bg-stone-100" : "border-stone-300 hover:border-stone-900"
        } p-6 flex flex-col items-center justify-center text-center`}
      >
        {uploading ? (
          <>
            <Loader2 size={20} className="animate-spin text-stone-500" />
            <div className="mt-2 text-sm text-stone-500 font-display">Uploading…</div>
          </>
        ) : (
          <>
            <Upload size={20} className="text-stone-500" />
            <div className="mt-2 text-sm text-stone-700 font-display">
              {multiple ? "Drag images here or click to upload" : "Drag an image here or click to upload"}
            </div>
            <div className="text-xs text-stone-500 mt-1">JPG · PNG · WEBP · up to 12MB each</div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          data-testid={`${testid}-input`}
          className="hidden"
        />
      </div>

      {/* Optional URL input fallback */}
      {!multiple && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image URL"
          data-testid={`${testid}-url`}
          className="mt-2 w-full border border-stone-200 px-3 py-2 font-sans text-xs focus:border-stone-900"
        />
      )}
    </div>
  );
}
