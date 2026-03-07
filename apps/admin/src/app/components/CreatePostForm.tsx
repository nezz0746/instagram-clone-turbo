"use client";

import { useState, useRef } from "react";
import { uploadImage, createPostAsRoot } from "../actions";

export function CreatePostForm({ rootUserId }: { rootUserId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    postId?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const added = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/"),
    );
    const updatedFiles = [...files, ...added];
    setFiles(updatedFiles);

    const newPreviews = added.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCaption = caption.trim();
    if (files.length === 0 && !trimmedCaption) return;

    setSubmitting(true);
    setResult(null);
    setUploadProgress("");

    try {
      const imageUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading image ${i + 1}/${files.length}...`);
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await uploadImage(formData);
        if (res.error) {
          setResult({ error: `Upload failed for image ${i + 1}: ${res.error}` });
          return;
        }
        imageUrls.push(res.url);
      }

      setUploadProgress(
        imageUrls.length > 0 ? "Creating post..." : "",
      );

      const res = await createPostAsRoot(
        imageUrls,
        trimmedCaption || undefined,
      );
      if (res.error) {
        setResult({ error: res.error });
      } else {
        setResult({ success: true, postId: res.postId });
        setCaption("");
        for (const p of previews) URL.revokeObjectURL(p);
        setFiles([]);
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setResult({ error: "Failed to create post" });
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  }

  const canSubmit = (files.length > 0 || caption.trim().length > 0) && !submitting;
  const isTextOnly = files.length === 0 && caption.trim().length > 0;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Create Post
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Post as @garona (root account)
        {isTextOnly && (
          <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
            Text only
          </span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Caption */}
        <div>
          <label
            htmlFor="caption"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Write something..."
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Images (optional)
          </label>
          <div className="mt-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700"
            />
          </div>
        </div>

        {/* Image previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map((src, i) => (
              <div
                key={src}
                className="group relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  &times;
                </button>
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting
              ? uploadProgress || "Publishing..."
              : `Publish ${files.length > 0 ? `(${files.length} image${files.length > 1 ? "s" : ""})` : "Text Post"}`}
          </button>

          {files.length > 0 && !submitting && (
            <button
              type="button"
              onClick={() => {
                for (const p of previews) URL.revokeObjectURL(p);
                setFiles([]);
                setPreviews([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Clear images
            </button>
          )}
        </div>

        {result?.success && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Post created successfully (ID: {result.postId})
          </p>
        )}
        {result?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {result.error}
          </p>
        )}
      </form>
    </section>
  );
}
