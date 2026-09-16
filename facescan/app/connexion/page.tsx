"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"connexion" | "inscription">(
    "inscription"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "inscription") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          router.push("/onboarding");
          return;
        }

        setMessage(
          "Votre compte a été créé. Vérifiez votre adresse e-mail pour confirmer votre compte."
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const user = data.user;

        if (!user) {
          throw new Error("Impossible de récupérer votre session.");
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (profile?.onboarding_completed === true) {
          router.push("/");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">
        <div className="pt-6 text-center">
          <div className="mb-3 text-3xl font-semibold tracking-tight text-[#102f3a]">
            Otavio
          </div>

          <p className="mx-auto max-w-xs text-sm leading-6 text-[#66757d]">
            Votre accompagnement personnalisé pour mieux prendre soin de vous.
          </p>
        </div>

        <div className="mt-10 rounded-[30px] border border-[#dce7e8] bg-white p-6 shadow-[0_20px_60px_rgba(16,47,58,0.08)]">
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[#f2f6f7] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("inscription");
                setError("");
                setMessage("");
              }}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                mode === "inscription"
                  ? "bg-white text-[#102f3a] shadow-sm"
                  : "text-[#738189]"
              }`}
            >
              Créer un compte
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("connexion");
                setError("");
                setMessage("");
              }}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                mode === "connexion"
                  ? "bg-white text-[#102f3a] shadow-sm"
                  : "text-[#738189]"
              }`}
            >
              Se connecter
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-[#102f3a]">
              {mode === "inscription"
                ? "Bienvenue chez Otavio"
                : "Bon retour"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6b7980]">
              {mode === "inscription"
                ? "Créez votre compte pour commencer votre expérience personnalisée."
                : "Connectez-vous pour retrouver votre profil et votre évolution."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#183d48]"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@exemple.com"
                className="w-full rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-4 py-4 text-sm text-[#183d48] outline-none transition placeholder:text-[#9aa7ad] focus:border-[#168f91]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#183d48]"
              >
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                autoComplete={
                  mode === "inscription" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Votre mot de passe"
                className="w-full rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-4 py-4 text-sm text-[#183d48] outline-none transition placeholder:text-[#9aa7ad] focus:border-[#168f91]"
              />
            </div>

            {mode === "connexion" && (
              <button
                type="button"
                className="text-left text-sm font-semibold text-[#168f91]"
              >
                Mot de passe oublié ?
              </button>
            )}

            {message && (
              <div className="rounded-2xl bg-[#e8f7ee] px-4 py-3 text-sm leading-5 text-[#28714b]">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-[#fff0eb] px-4 py-3 text-sm leading-5 text-[#a64f3d]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!email || !password || loading}
              className="mt-2 w-full rounded-2xl bg-[#102f3a] px-5 py-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Veuillez patienter..."
                : mode === "inscription"
                  ? "Créer mon compte"
                  : "Se connecter"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e4ebec]" />
            <span className="text-xs text-[#9aa7ad]">ou</span>
            <div className="h-px flex-1 bg-[#e4ebec]" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded-2xl border border-[#d7e2e4] bg-white px-5 py-4 text-sm font-semibold text-[#183d48] transition hover:bg-[#f7fafb] disabled:opacity-50"
          >
            Continuer avec Google
          </button>
        </div>

        <p className="mt-auto px-6 pt-8 text-center text-xs leading-5 text-[#89969c]">
          Vos informations servent à personnaliser votre expérience Otavio.
        </p>
      </div>
    </main>
  );
}
