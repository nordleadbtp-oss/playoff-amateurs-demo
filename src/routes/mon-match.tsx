import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, BellRing, CheckCircle2, Clock, Share2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { FloatingInput } from "@/components/FloatingInput";
import { upsertReservation } from "@/lib/reservations";

const TERRAIN_DATA: Record<string, { name: string; sport: string; emoji: string; price: number }> = {
  "1":  { name: "Terrain Municipal Avon",            sport: "Football 5v5", emoji: "⚽", price: 70 },
  "2":  { name: "Complexe Sportif de Fontainebleau", sport: "Football 5v5", emoji: "⚽", price: 75 },
  "3":  { name: "Stade Couvert de Nemours",          sport: "Football 5v5", emoji: "⚽", price: 80 },
  "11": { name: "Stade Jean Bouin Melun",             sport: "Football 5v5", emoji: "⚽", price: 72 },
  "12": { name: "City Stade de Barbizon",             sport: "Football 5v5", emoji: "⚽", price: 65 },
  "13": { name: "Terrain Synthétique Moret",          sport: "Football 5v5", emoji: "⚽", price: 68 },
  "21": { name: "Gymnase Avon Centre",                sport: "Basket à 5", emoji: "🏀", price: 30 },
  "22": { name: "Salle Polyvalente Fontainebleau",    sport: "Basket à 5", emoji: "🏀", price: 28 },
  "23": { name: "Playground Nemours Sud",             sport: "Basket à 5", emoji: "🏀", price: 32 },
  "24": { name: "Gymnase Léo Lagrange",          sport: "Basket à 5", emoji: "🏀", price: 29 },
  "25": { name: "Complexe Bois-le-Roi",               sport: "Basket à 5", emoji: "🏀", price: 27 },
  "26": { name: "Halle des Sports Moret",             sport: "Basket à 5", emoji: "🏀", price: 33 },
  "31": { name: "Club Padel Avon",                    sport: "Padel",       emoji: "🎾", price: 25 },
  "32": { name: "Padel Arena Fontainebleau",          sport: "Padel",       emoji: "🎾", price: 22 },
  "33": { name: "Padel Club Moret",                   sport: "Padel",       emoji: "🎾", price: 27 },
  "34": { name: "Padel Indoor Melun",                 sport: "Padel",       emoji: "🎾", price: 26 },
  "35": { name: "Padel Garden Barbizon",              sport: "Padel",       emoji: "🎾", price: 24 },
  "36": { name: "Padel Center Nemours",               sport: "Padel",       emoji: "🎾", price: 28 },
};
const DEFAULT_TERRAIN_INFO = { name: "Terrain Municipal Avon", sport: "Football 5v5", emoji: "⚽", price: 70 };

export const Route = createFileRoute("/mon-match")({
  validateSearch: (search: Record<string, unknown>) => ({
    terrainId: typeof search.terrainId === "string" ? search.terrainId : undefined,
    slot: typeof search.slot === "string" ? search.slot : undefined,
    date: typeof search.date === "string" ? search.date : undefined,
  }),
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
  { id: 1,  initials: "TD", name: "Thai (moi)",        color: "#0D1B4B", paid: true,  isMe: true },
  { id: 2,  initials: "KB", name: "Karim Benali",       color: "#FF6B00", paid: true  },
  { id: 3,  initials: "AD", name: "Antoine Dubois",     color: "#22C55E", paid: true  },
  { id: 4,  initials: "SH", name: "Sofiane Hamidi",     color: "#3B82F6", paid: false },
  { id: 5,  initials: "HL", name: "Hugo Leroy",         color: "#A855F7", paid: false },
  { id: 6,  initials: "NM", name: "Nicolas Moreau",     color: "#EC4899", paid: true  },
  { id: 7,  initials: "YB", name: "Yanis Boukhari",     color: "#14B8A6", paid: false },
  { id: 8,  initials: "TR", name: "Thomas Renard",      color: "#EAB308", paid: true  },
  { id: 9,  initials: "CM", name: "Clément Martinez",   color: "#0D1B4B", paid: false },
  { id: 10, initials: "RD", name: "Romain Delacroix",   color: "#FF6B00", paid: false },
];

const AVATAR_COLORS = ["#0D1B4B", "#FF6B00", "#22C55E", "#3B82F6", "#A855F7", "#EC4899", "#14B8A6", "#EAB308"];

const LS_KEY = "playoff_match";

function saveToLS(terrainId: string | undefined, slot: string | undefined, date: string | undefined, players: Player[], confirmed: boolean) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ terrainId, slot, date, players, confirmed }));
    if (terrainId && slot && date) {
      upsertReservation({ terrainId, slot, date, players, confirmed });
    }
  } catch {}
}

function MonMatchPage() {
  const search = Route.useSearch();
  // Si pas de query params (accès via BottomNav), fallback sur localStorage
  const lsSaved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } })();
  const terrainId = search.terrainId ?? lsSaved.terrainId;
  const slot      = search.slot      ?? lsSaved.slot;
  const date      = search.date      ?? lsSaved.date;
  const terrainInfo = terrainId ? (TERRAIN_DATA[terrainId] ?? DEFAULT_TERRAIN_INFO) : DEFAULT_TERRAIN_INFO;

  const slotLabel = (() => {
    if (slot && date) {
      const [y, m, d2] = date.split("-");
      const endH = String(Number(slot.split(":")[0]) + 1).padStart(2, "0");
      return `${d2}/${m}/${y} · ${slot} – ${endH}:00`;
    }
    return "Sam 31 mai · 15h00 – 16h00";
  })();

  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (terrainId && saved.terrainId && saved.terrainId !== terrainId) return false;
      return saved.confirmed === true;
    } catch { return false; }
  });
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return Array.isArray(saved.players) && saved.players.length > 0 ? saved.players : INITIAL_PLAYERS;
    } catch { return INITIAL_PLAYERS; }
  });
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const TERRAIN_TOTAL = terrainInfo.price;
  const paidCount = useMemo(() => players.filter((p) => p.paid).length, [players]);
  const total = players.length;
  const pricePerPlayer = total > 0 ? Math.ceil(TERRAIN_TOTAL / total) : TERRAIN_TOTAL;
  const isRounded = total > 0 && TERRAIN_TOTAL % total !== 0;
  const collected = paidCount * pricePerPlayer;
  const totalAmount = total * pricePerPlayer;
  const remaining = totalAmount - collected;
  const progress = total > 0 ? (paidCount / total) * 100 : 0;
  const pendingCount = total - paidCount;

  const updatePlayers = (updater: (list: Player[]) => Player[]) => {
    setPlayers((prev) => {
      const next = updater(prev);
      saveToLS(terrainId, slot, date, next, confirmed);
      return next;
    });
  };

  const sendIndividualLink = async (p: Player) => {
    const url = `https://pay.playoff.app/match-12345/joueur-${p.id}`;
    try { await navigator.clipboard.writeText(url); } catch {}
    toast.success(`Lien copié pour ${p.name} — à envoyer par WhatsApp ou SMS`);
  };

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
    updatePlayers((p) => [...p, newPlayer]);
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
          {total > 0 && paidCount === total ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border" style={{ background: "#DCFCE7", color: "#15803D", borderColor: "#86EFAC" }}>
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} /> Confirmé
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border" style={{ background: "#FEF9C3", color: "#92400E", borderColor: "#FDE68A" }}>
              <Clock className="h-4 w-4" strokeWidth={2} /> En attente
            </span>
          )}
        </div>

        {/* Recap terrain */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-muted inline-flex items-center justify-center text-3xl shrink-0" aria-hidden>
            {terrainInfo.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold">{terrainInfo.name}</p>
            <p className="text-sm text-muted-foreground">{terrainInfo.sport} · 1h</p>
            <p className="text-sm text-muted-foreground">{slotLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Prix total</p>
            <p className="font-extrabold text-xl" style={{ color: "#FF6B00" }}>{TERRAIN_TOTAL} €</p>
          </div>
        </div>

        {/* Calcul par joueur */}
        <div className="rounded-2xl p-5 text-primary-foreground text-center" style={{ background: "#0D1B4B" }}>
          <p className="font-bold text-xl">
            {TERRAIN_TOTAL} € ÷ {total} joueur{total > 1 ? "s" : ""} ={" "}
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

        {/* Barre de progression */}
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

        {/* Liste joueurs */}
        <div>
          <p className="text-base font-medium text-muted-foreground mb-2">Joueurs ({total})</p>
          <ul className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {players.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div
                  className="h-10 w-10 rounded-full text-white font-bold text-sm inline-flex items-center justify-center shrink-0"
                  style={{ background: p.color }}
                  aria-hidden
                >
                  {p.initials}
                </div>
                <p className="flex-1 font-medium truncate">{p.name}</p>
                <p className="text-sm font-semibold text-right whitespace-nowrap">
                  {pricePerPlayer}€{isRounded && <span className="text-[10px] font-normal text-muted-foreground ml-1">(arrondi)</span>}
                </p>
                {p.paid ? (
                  <button
                    onClick={() => !p.isMe && updatePlayers((list) => list.map((x) => x.id === p.id ? { ...x, paid: false } : x))}
                    disabled={p.isMe}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition duration-200 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: "#DCFCE7", color: "#15803D" }}
                  >
                    Payé ✅
                  </button>
                ) : (
                  <button
                    onClick={() => updatePlayers((list) => list.map((x) => x.id === p.id ? { ...x, paid: true } : x))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition duration-200 hover:opacity-90 cursor-pointer"
                    style={{ background: "#FED7AA", color: "#9A3412" }}
                  >
                    <Clock className="h-3 w-3" strokeWidth={2} /> En attente
                  </button>
                )}
                {!p.isMe && (
                  <button
                    onClick={() => {
                      updatePlayers((list) => list.filter((x) => x.id !== p.id));
                      toast.success(`${p.name} retiré du match`);
                    }}
                    className="h-7 w-7 rounded-full hover:bg-red-50 inline-flex items-center justify-center text-muted-foreground hover:text-red-500 transition ml-1"
                    aria-label={`Retirer ${p.name}`}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
                {/* Bouton envoi lien dès qu'un joueur est ajouté, qu'il ait payé ou non */}
                {!p.isMe && (
                  <button
                    onClick={() => sendIndividualLink(p)}
                    className="ml-auto h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-90 active:scale-[0.99] transition"
                    style={p.paid
                      ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" }
                      : { background: "#0D1B4B", color: "#fff" }
                    }
                  >
                    <Share2 className="h-3 w-3" strokeWidth={2} />
                    {p.paid ? "Renvoyer le lien" : `Envoyer le lien · ${pricePerPlayer}€`}
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
          onClick={() => toast.success(`Rappel envoyé à ${pendingCount} joueur${pendingCount > 1 ? "s" : ""}`)}
          disabled={pendingCount === 0}
          className="w-full h-14 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 text-white hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#22C55E" }}
        >
          <BellRing className="h-5 w-5" strokeWidth={2} />
          Envoyer un rappel ({pendingCount} joueur{pendingCount > 1 ? "s" : ""})
        </button>

        {!confirmed && (
          <button
            onClick={() => {
              setConfirmed(true);
              saveToLS(terrainId, slot, date, players, true);
              toast.success("Match confirmé ! Retrouvez-le dans vos réservations.");
              setTimeout(() => {
                navigate({
                  to: "/mes-reservations",
                  search: { terrainId, slot, date },
                });
              }, 1200);
            }}
            className="w-full h-14 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition"
            style={{ background: "#FF6B00", color: "#1A1A1A" }}
          >
            <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
            Confirmer le match
          </button>
        )}
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
            <p className="text-sm text-muted-foreground mb-5">Choisissez le canal d&apos;envoi aux joueurs.</p>
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

