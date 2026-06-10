import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, BellRing, CheckCircle2, Clock, Share2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { FloatingInput } from "@/components/FloatingInput";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const Route = createFileRoute("/mon-match")({
  head: () => ({
    meta: [
      { title: "Mon match — PlayOff Amateurs" },
      { name: "description", content: "Suivez les paiements et les joueurs de votre match." },
    ],
  }),
  component: MonMatchPage,
});

type Player = {
  id: number;
  initials: string;
  name: string;
  color: string;
  paid: boolean;
  isMe?: boolean;
};

const INITIAL_PLAYERS: Player[] = [
  { id: 1, initials: "TD", name: "Thai (moi)", color: "#0D1B4B", paid: true, isMe: true },
];

const AVATAR_COLORS = ["#0D1B4B", "#FF6B00", "#22C55E", "#3B82F6", "#A855F7", "#EC4899", "#14B8A6", "#EAB308"];

function MonMatchPage() {
  const { user } = useRequireAuth("/mon-match");
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  if (!user) return null;


  const paidCount = useMemo(() => players.filter((p) => p.paid).length, [players]);
  const total = players.length;
  const pricePerPlayer = 8;
  const collected = paidCount * pricePerPlayer;
  const totalAmount = total * pricePerPlayer;
  const remaining = totalAmount - collected;
  const progress = total > 0 ? (paidCount / total) * 100 : 0;
  const pendingCount = total - paidCount;

  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    const initials =
      firstName.trim().slice(0, 1).toUpperCase() +
      (email.trim().slice(0, 1).toUpperCase() || firstName.trim().slice(1, 2).toUpperCase() || "X");
    const newPlayer: Player = {
      id: Date.now(),
      initials,
      name: firstName.trim(),
      color: AVATAR_COLORS[players.length % AVATAR_COLORS.length],
      paid: false,
    };
    setPlayers((p) => [...p, newPlayer]);
    setFirstName("");
    setEmail("");
    setShowForm(false);
    toast.success(`${newPlayer.name} a été ajouté au match`);
  };

  return (
    <div className="min-h-screen pb-28 md:pb-12">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-5 sm:py-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/terrains" className="h-10 w-10 rounded-full bg-card border border-border inline-flex items-center justify-center hover:bg-muted transition" aria-label="Retour">
              <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Mon match</h1>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border" style={{ background: "#DCFCE7", color: "#15803D", borderColor: "#86EFAC" }}>
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} /> Réservé
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-muted inline-flex items-center justify-center text-3xl shrink-0" aria-hidden>⚽</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold">Terrain Municipal Avon</p>
            <p className="text-sm text-muted-foreground">Foot à 5 · 1h</p>
            <p className="text-sm text-muted-foreground">Sam 31 mai · 15h00 – 16h00</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Prix total</p>
            <p className="font-extrabold text-xl" style={{ color: "#FF6B00" }}>80 €</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 text-primary-foreground text-center" style={{ background: "#0D1B4B" }}>
          <p className="font-bold text-xl">
            {totalAmount} € ÷ {total} joueurs ={" "}
            <span style={{ color: "#FF6B00" }}>{pricePerPlayer} €</span>
          </p>
          <p className="text-sm opacity-80 mt-1">par joueur · tout compris</p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShareOpen(true)}
              className="h-12 px-6 rounded-xl font-bold inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition"
              style={{ background: "#FF6B00", color: "#1A1A1A" }}
            >
              <Share2 className="h-5 w-5" strokeWidth={2} /> Partager le lien de paiement
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold" style={{ color: "#0D1B4B" }}>Paiements reçus</p>
            <p className="font-bold">{paidCount} / {total} joueurs</p>
          </div>
          <div className="mt-3 h-3 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "#22C55E" }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {collected} € collectés · {remaining} € restants
          </p>
        </div>

        <div>
          <p className="text-base font-medium text-muted-foreground mb-2">Joueurs ({total})</p>
          <ul className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {players.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="h-10 w-10 rounded-full text-white font-bold text-sm inline-flex items-center justify-center shrink-0"
                  style={{ background: p.color }}
                  aria-hidden
                >
                  {p.initials}
                </div>
                <p className="flex-1 font-medium truncate">{p.name}</p>
                <p className="text-sm font-semibold w-10 text-right">{pricePerPlayer}€</p>
                {p.paid ? (
                  <button
                    onClick={() => !p.isMe && setPlayers((list) => list.map((x) => x.id === p.id ? { ...x, paid: false } : x))}
                    disabled={p.isMe}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition duration-200 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: "#DCFCE7", color: "#15803D" }}
                  >
                    Payé ✅
                  </button>
                ) : (
                  <button
                    onClick={() => setPlayers((list) => list.map((x) => x.id === p.id ? { ...x, paid: true } : x))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition duration-200 hover:opacity-90 cursor-pointer"
                    style={{ background: "#FED7AA", color: "#9A3412" }}
                  >
                    <Clock className="h-3 w-3" strokeWidth={2} /> En attente
                  </button>
                )}
                {!p.isMe && (
                  <button
                    onClick={() => {
                      setPlayers((list) => list.filter((x) => x.id !== p.id));
                      toast.success(`${p.name} retiré du match`);
                    }}
                    className="h-7 w-7 rounded-full hover:bg-red-50 inline-flex items-center justify-center text-muted-foreground hover:text-red-500 transition ml-1"
                    aria-label={`Retirer ${p.name}`}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {showForm ? (
            <form onSubmit={addPlayer} className="mt-3 bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <FloatingInput label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus required />
                <FloatingInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFirstName(""); setEmail(""); }}
                  className="h-12 px-5 rounded-xl border border-border bg-card font-semibold hover:bg-muted transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-12 px-6 rounded-xl font-bold hover:opacity-95 active:scale-[0.99] transition"
                  style={{ background: "#FF6B00", color: "#1A1A1A" }}
                >
                  Ajouter
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 w-full h-12 rounded-xl border-2 bg-card font-semibold inline-flex items-center justify-center gap-2 hover:bg-muted transition"
              style={{ borderColor: "#0D1B4B", color: "#0D1B4B" }}
            >
              <Plus className="h-5 w-5" strokeWidth={2} /> Ajouter un joueur
            </button>
          )}
        </div>

        <button
          onClick={() =>
            toast.success(`Rappel envoyé à ${pendingCount} joueur${pendingCount > 1 ? "s" : ""}`)
          }
          disabled={pendingCount === 0}
          className="w-full h-14 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 text-white hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#22C55E" }}
        >
          <BellRing className="h-5 w-5" strokeWidth={2} />
          Envoyer un rappel ({pendingCount} joueur{pendingCount > 1 ? "s" : ""})
        </button>
      </main>

      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" onClick={() => setShareOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-xl p-6 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg" style={{ color: "#0D1B4B" }}>Partager le lien de paiement</h3>
              <button
                onClick={() => setShareOpen(false)}
                className="h-9 w-9 rounded-full hover:bg-muted inline-flex items-center justify-center"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Choisissez le canal d'envoi aux joueurs.</p>
            <div className="space-y-3">
              {(() => {
                const PAY_URL = "https://playoff.app/payer/match-12345";
                const copyAnd = (label: string) => async () => {
                  try { await navigator.clipboard.writeText(PAY_URL); } catch {}
                  setShareOpen(false);
                  toast.success(`Lien copié — prêt à partager via ${label}`);
                };
                return (
                  <>
                    <button
                      onClick={copyAnd("WhatsApp")}
                      className="w-full h-12 rounded-xl font-bold inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition"
                      style={{ background: "#25D366", color: "#fff" }}
                    >
                      💬 Partager via WhatsApp
                    </button>
                    <button
                      onClick={copyAnd("SMS")}
                      className="w-full h-12 rounded-xl font-bold inline-flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition"
                      style={{ background: "#0D1B4B", color: "#fff" }}
                    >
                      📱 Envoyer par SMS
                    </button>
                    <button
                      onClick={copyAnd("mail")}
                      className="w-full h-12 rounded-xl font-bold inline-flex items-center justify-center gap-2 border-2 bg-card hover:bg-muted transition"
                      style={{ borderColor: "#0D1B4B", color: "#0D1B4B" }}
                    >
                      ✉️ Envoyer par mail
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <BottomNav active="reservations" />
    </div>
  );
}
