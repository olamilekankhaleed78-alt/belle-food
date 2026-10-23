"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: String(form.get("username") ?? "admin"),
        password: String(form.get("password") ?? ""),
      }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(payload.message ?? "Authentication failed");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md border border-[#222] bg-[#121212] p-6">
      <h1 className="font-serif-display text-4xl text-white">Admin Login</h1>
      <p className="mt-2 text-sm text-zinc-400">Secure access for Belle Food operations.</p>

      <div className="mt-6 space-y-3">
        <input
          name="username"
          defaultValue="admin"
          required
          className="w-full border border-[#2b2b2b] bg-transparent px-4 py-3"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full border border-[#2b2b2b] bg-transparent px-4 py-3"
        />
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black disabled:opacity-50"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
