import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FloatingInput } from "@/components/FloatingInput";
import logoAsset from "@/assets/playoff-logo.png.asset.json";

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
      toast.success(mode === "login" ? "Bienvenue 👋 (démo)" : "Compte créé 🎉 (démo)");
      navigate({ to: "/terrains" });
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/terrains" className="flex justify-center mb-8">
          <img src={logoAsset.url} alt="PlayOff Amateurs" className="h-16 w-auto" />
        </Link>

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
            {mode === "login" ? "Bon retour 👋" : "Créer mon compte"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {mode === "login" ? "Connecte-toi à PlayOff Amateurs" : "Rejoins PlayOff Amateurs"}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <FloatingInput label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
            )}
            <FloatingInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            <FloatingInput label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={6} />

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
