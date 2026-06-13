import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FloatingInput } from "@/components/FloatingInput";

export const Route = createFileRoute("/connexion")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "signup" ? "signup" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Connexion — PlayOff Amateurs" },
      { name: "description", content: "Connectez-vous à votre compte PlayOff Amateurs." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(mode === "login" ? "Bienvenue (démo)" : "Compte créé (démo)");
      navigate({ to: "/terrains" });
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/playoff-logo.png" alt="PlayOff Amateurs" className="h-16 w-auto" />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex p-1 bg-muted rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 h-10 rounded-lg text-sm font-semibold transition ${
                mode === "login" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 h-10 rounded-lg text-sm font-semibold transition ${
                mode === "signup" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              S'inscrire
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold">
            {mode === "login" ? "Bon retour" : "Créer mon compte"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {mode === "login" ? "Connecte-toi à PlayOff Amateurs" : "Rejoins PlayOff Amateurs"}
          </p>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                toast.success("Connexion Google simulée — démo Sprint 4");
                navigate({ to: "/terrains" });
              }, 800);
            }}
            disabled={loading}
            className="mt-6 w-full h-12 rounded-xl font-semibold border border-border bg-card hover:bg-muted inline-flex items-center justify-center gap-3 transition disabled:opacity-60"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-card text-xs text-muted-foreground">ou par email</span></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <FloatingInput label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
            )}
            <FloatingInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            <FloatingInput label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={6} />

            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => toast.info("Lien de réinitialisation envoyé (démo)")} className="text-xs text-muted-foreground hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-white hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
              style={{ background: "#0D1B4B" }}
            >
              {loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Authentification simulée — démo Sprint 4
          </p>
        </div>
      </div>
    </div>
  );
}
