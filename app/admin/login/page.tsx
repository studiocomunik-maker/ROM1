"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const field =
    "mt-1 w-full border border-paper/15 bg-white/[0.04] px-4 py-3 text-base text-paper outline-none transition-colors placeholder:text-paper/25 focus:border-orange focus:bg-white/[0.07]";

  return (
    <main className="admin grain flex min-h-screen items-center justify-center overflow-hidden bg-coal px-6 text-paper">
      <form onSubmit={onSubmit} className="w-full max-w-[360px] space-y-5">
        <div className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-blanc-128.png"
            srcSet="/logo-blanc-64.png 1x, /logo-blanc-128.png 2x, /logo-blanc-192.png 3x"
            width={179}
            height={128}
            alt="rom1"
            className="mb-7 h-10 w-auto"
          />
          <p className="font-display text-sm uppercase tracking-[0.3em] text-orange">Admin</p>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-tight">Connexion</h1>
        </div>

        <label className="block">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-paper/50">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </label>

        <label className="block">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-paper/50">Mot de passe</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
        </label>

        {error && (
          <p className="border border-orange/40 bg-orange/5 p-3 font-mono text-sm leading-relaxed text-orange">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange px-6 py-3 font-display text-base uppercase tracking-[0.12em] text-coal transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
