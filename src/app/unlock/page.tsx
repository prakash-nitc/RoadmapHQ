"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Rocket, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function UnlockPage() {
  return (
    <Suspense fallback={null}>
      <UnlockForm />
    </Suspense>
  );
}

function UnlockForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(next);
        router.refresh();
      } else {
        setError("Wrong password.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl p-7"
        style={{
          background:
            "radial-gradient(at top left, rgba(79, 140, 255, 0.08), transparent 60%), radial-gradient(at bottom right, rgba(168, 85, 247, 0.06), transparent 60%), var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 20px 60px -20px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-accent-blue)] font-semibold">
              DSA Mission · Control
            </p>
            <h1 className="text-xl font-bold tracking-tight">
              Welcome back
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold mb-2"
            >
              <Lock className="w-3 h-3" />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-blue)]"
            />
          </div>

          {error && (
            <p className="text-xs text-[var(--color-accent-red)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {submitting ? "Unlocking..." : "Unlock"}
          </button>
        </form>

        <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-5">
          One-shot login per device · cookie remembers you for 90 days
        </p>
      </div>
    </div>
  );
}
