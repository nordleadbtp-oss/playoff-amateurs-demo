import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FloatingInput } from "@/components/FloatingInput";
import logoAsset from "@/assets/playoff-logo.png.asset.json";

export const Route = createFileRoute("/inscription")({
  head: () => ({
    meta: [
      { title: "Créer mon compte — PlayOff Amateurs" },
      { name: "description", content: "Rejoignez PlayOff Amateurs et réservez des terrains entre amis." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [v, setV] = useState({ prenom: "", nom: "", email: "", password: "", ville: "" });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/terrains" className="flex justify-center mb-8">
          <img src={logoAsset.url} alt="PlayOff Amateurs" className="h-16 w-auto" />
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold">Créer mon compte</h1>
          <p className="mt-1 text-muted-foreground">Rejoins PlayOff Amateurs</p>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/terrains" }); }}
            className="mt-6 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput label="Prénom" value={v.prenom} onChange={set("prenom")} />
              <FloatingInput label="Nom" value={v.nom} onChange={set("nom")} />
            </div>
            <FloatingInput label="Email" type="email" value={v.email} onChange={set("email")} />
            <FloatingInput label="Mot de passe" type="password" value={v.password} onChange={set("password")} />
            <FloatingInput label="Ville" value={v.ville} onChange={set("ville")} />

            <button
              type="submit"
              className="w-full h-12 rounded-xl font-bold hover:opacity-95 active:scale-[0.99] transition"
              style={{ background: "#FF6B00", color: "#1A1A1A" }}
            >
              Créer mon compte
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/connexion" className="font-semibold underline underline-offset-4 hover:text-primary">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
