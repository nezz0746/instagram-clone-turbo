"use client";

import { useState } from "react";
import { createPostAsRoot } from "../actions";

export function CreatePostForm({ rootUserId }: { rootUserId: string }) {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    postId?: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setSubmitting(true);
    setResult(null);
    try {
      const res = await createPostAsRoot(imageUrl.trim(), caption.trim() || undefined);
      if (res.error) {
        setResult({ error: res.error });
      } else {
        setResult({ success: true, postId: res.postId });
        setImageUrl("");
        setCaption("");
      }
    } catch {
      setResult({ error: "Failed to create post" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Create Post
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Post as @garona (root account)
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Image URL
          </label>
          <input
            id="imageUrl"
            type="url"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="caption"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Caption (optional)
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Write a caption..."
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

        {imageUrl && (
          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Preview"
              className="max-h-64 w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !imageUrl.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting ? "Publishing..." : "Publish Post"}
        </button>

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
