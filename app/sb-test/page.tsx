"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

/* Page de diagnostic : vérifie que la chaîne env → Supabase → RLS répond,
   en local comme sur Vercel. À supprimer une fois la connexion validée. */
type State =
  | { phase: "loading" }
  | { phase: "ok"; rows: number; sample: unknown }
  | { phase: "error"; message: string };

export default function SbTest() {
  const [state, setState] = useState<State>({ phase: "loading" });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  useEffect(() => {
    if (!url || !hasKey) {
      setState({
        phase: "error",
        message: "Variables d'environnement manquantes (NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY).",
      });
      return;
    }
    const supabase = createClient();
    supabase
      .from("ping")
      .select("*")
      .then(({ data, error }) => {
        if (error) setState({ phase: "error", message: error.message });
        else setState({ phase: "ok", rows: data?.length ?? 0, sample: data?.[0] ?? null });
      });
  }, [url, hasKey]);

  const color =
    state.phase === "ok" ? "#3ddc84" : state.phase === "error" ? "#ff3d1f" : "#f5f4f2";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-coal px-6 text-paper">
      <p className="font-display text-xs uppercase tracking-[0.3em] text-orange">
        ★ Diagnostic Supabase
      </p>
      <div className="font-display text-4xl uppercase tracking-tight" style={{ color }}>
        {state.phase === "loading" && "Connexion…"}
        {state.phase === "ok" && "✓ Connecté"}
        {state.phase === "error" && "✕ Échec"}
      </div>

      <div className="w-full max-w-[560px] space-y-2 border border-paper/15 p-5 font-mono text-xs text-paper/70">
        <p>URL : {url ? new URL(url).host : "—"}</p>
        <p>Clé publishable : {hasKey ? "présente" : "absente"}</p>
        {state.phase === "ok" && (
          <>
            <p className="text-[#3ddc84]">Table « ping » lue : {state.rows} ligne(s).</p>
            {state.sample != null && (
              <pre className="overflow-x-auto whitespace-pre-wrap text-paper/50">
                {JSON.stringify(state.sample, null, 2)}
              </pre>
            )}
          </>
        )}
        {state.phase === "error" && <p className="text-orange">{state.message}</p>}
      </div>

      <p className="max-w-[560px] text-center font-mono text-[10px] uppercase tracking-[0.15em] text-paper/35">
        Page temporaire — à retirer une fois la connexion validée.
      </p>
    </main>
  );
}
