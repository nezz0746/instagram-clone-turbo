"use client";

import { useState } from "react";
import { createRootAccount } from "../actions";

interface RootUser {
  id: string;
  username: string | null;
  name: string;
  email: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

export function RootAccountSection({
  initialUser,
  vouchCount,
  rang,
}: {
  initialUser: RootUser | null;
  vouchCount: number;
  rang: number;
}) {
  const [user, setUser] = useState<RootUser | null>(initialUser);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const result = await createRootAccount();
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        setUser(result.user);
      }
    } catch {
      setError("Failed to create root account");
    } finally {
      setCreating(false);
    }
  }

  if (!user) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Root Account
        </h2>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            No root account exists yet. Create one to have an official Garona
            user account.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {creating ? "Creating..." : "Create Root Account"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Root Account
      </h2>
      <div className="mt-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Username
            </p>
            <p className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-100">
              @{user.username}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Name
            </p>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {user.name}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              ID
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
              {user.id}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Rang
            </p>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {rang} ({vouchCount} vouches)
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Email
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
              {user.email}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Created
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
