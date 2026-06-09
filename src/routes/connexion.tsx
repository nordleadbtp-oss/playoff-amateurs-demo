import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FloatingInput } from "@/components/FloatingInput";
import logoAsset from "@/assets/playoff-logo.png.asset.json";

export const Route = createFileRoute("/connexion")({
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/terrains" className="flex justify-center mb-8">
          <img src={logoAsset.url} alt="PlayOff Amateurs" className="h-16 w-auto" />
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold">Bon retour 👋</h1>
          <p className="mt-1 text-muted-foreground">Connecte-toi à PlayOff Amateurs</p>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/terrains" }); }}
            className="mt-6 space-y-3"
          >
            <FloatingInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <FloatingInput label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

            <button
              type="submit"
              className="w-full h-12 rounded-xl font-bold hover:opacity-95 active:scale-[0.99] transition"
              style={{ background: "#FF6B00", color: "#1A1A1A" }}
            >
              Se connecter
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="font-semibold underline underline-offset-4 hover:text-primary">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
