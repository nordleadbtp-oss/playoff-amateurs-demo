import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Calendar, ChevronRight, BellRing, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { AppFooter } from "@/components/AppFooter";
import { getReservations, removeReservation, type Reservation } from "@/lib/reservations";

const TERRAIN_DATA: Record<string, { name: string; sport: string; emoji: string; price: number; city: string }> = {
  "1":  { name: "Terrain Municipal Avon",            sport: "Football 5v5", emoji: "⚽", price: 70, city: "Avon" },
  "2":  { name: "Complexe Sportif de Fontainebleau", sport: "Football 5v5", emoji: "⚽", price: 75, city: "Fontainebleau" },
  "3":  { name: "Stade Couvert de Nemours",          sport: "Football 5v5", emoji: "⚽", price: 80, city: "Nemours" },
  "11": { name: "Stade Jean Bouin Melun",             sport: "Football 5v5", emoji: "⚽", price: 72, city: "Melun" },
  "12": { name: "City Stade de Barbizon",             sport: "Football 5v5", emoji: "⚽", price: 65, city: "Barbizon" },
  "13": { name: "Terrain Synthétique Moret",          sport: "Football 5v5", emoji: "⚽", price: 68, city: "Moret-sur-Loing" },
  "21": { name: "Gymnase Avon Centre",                sport: "Basket à 5", emoji: "🏀", price: 30, city: "Avon" },
  "22": { name: "Salle Polyvalente Fontainebleau",    sport: "Basket à 5", emoji: "🏀", price: 28, city: "Fontainebleau" },
  "23": { name: "Playground Nemours Sud",             sport: "Basket à 5", emoji: "🏀", price: 32, city: "Nemours" },
  "24": { name: "Gymnase Léo Lagrange",               sport: "Basket à 5", emoji: "🏀", price: 29, city: "Melun" },
  "25": { name: "Complexe Bois-le-Roi",               sport: "Basket à 5", emoji: "🏀", price: 27, city: "Bois-le-Roi" },
  "26": { name: "Halle des Sports Moret",             sport: "Basket à 5", emoji: "🏀", price: 33, city: "Moret-sur-Loing" },
  "31": { name: "Club Padel Avon",                    sport: "Padel",       emoji: "🎾", price: 25, city: "Avon" },
  "32": { name: "Padel Arena Fontainebleau",          sport: "Padel",       emoji: "🎾", price: 22, city: "Fontainebleau" },
  "33": { name: "Padel Club Moret",                   sport: "Padel",       emoji: "🎾", price: 27, city: "Moret-sur-Loing" },
  "34": { name: "Padel Indoor Melun",                 sport: "Padel",       emoji: "🎾", price: 26, city: "Melun" },
  "35": { name: "Padel Garden Barbizon",              sport: "Padel",       emoji: "🎾", price: 24, city: "Barbizon" },
  "36": { name: "Padel Center Nemours",               sport: "Padel",       emoji: "🎾", price: 28, city: "Nemours" },
};
const DEFAULT_TERRAIN = { name: "Terrain", sport: "—", emoji: "⚽", price: 0, city: "—" };

function formatSlotLabel(slot: string, date: string) {
  const [y, m, d] = date.split("-");
  const months = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
  const endH = String(Number(slot.split(":")[0]) + 1).padStart(2, "0");
  return `${d} ${months[Number(m) - 1]} ${y} · ${slot} – ${endH}:00`;
}

export const Route = createFileRoute("/mes-reservations")({
  validateSearch: (search: Record<string, unknown>) => ({
    terrainId: typeof search.terrainId === "string" ? search.terrainId : undefined,
    slot: typeof search.slot === "string" ? search.slot : undefined,
    date: typeof search.date === "string" ? search.date : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mes réservations — PlayOff Amateurs" },
      { name: "description", content: "Retrouvez toutes vos réservations de terrains." },
    ],
  }),
  component: MesReservationsPage,
});

function MesReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setReservations(getReservations().sort((a, b) => b.updatedAt - a.updatedAt));
    setMounted(true);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeReservation(id);
    setReservations((prev) => prev.filter((r) => r.id !== id));
    toast.success("Réservation supprimée");
  };

  return (
    <div className="min-h-screen pb-28 md:pb-12">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-5">
        <h1 className="text-2xl sm:text-3xl font-bold">Mes réservations</h1>

        {!mounted ? null : reservations.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl px-6 py-12 text-center flex flex-col items-center gap-3">
            <div className="text-6xl" aria-hidden>📋</div>
            <h2 className="text-xl font-bold" style={{ color: "#142852" }}>
              Aucune réservation pour l'instant
            </h2>
            <p className="text-muted-foreground">Réserve un terrain pour commencer</p>
            <Link
              to="/terrains"
              className="mt-3 h-12 px-6 rounded-xl font-bold inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition text-white"
              style={{ background: "#142852" }}
            >
              Trouver un terrain
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => {
              const terrain = TERRAIN_DATA[r.terrainId] ?? DEFAULT_TERRAIN;
              const slotLabel = formatSlotLabel(r.slot, r.date);
              const allPaid = r.players.length > 0 && r.players.every((p) => p.paid);
              const isConfirmed = r.confirmed || allPaid;
              return (
                <div key={r.id} className="relative">
                  <Link
                    to="/mon-match"
                    search={{ terrainId: r.terrainId, slot: r.slot, date: r.date }}
                    className="block bg-card border border-border rounded-2xl p-4 hover:shadow-md hover:border-primary/30 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-full bg-muted inline-flex items-center justify-center text-3xl shrink-0" aria-hidden>
                        {terrain.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold">{terrain.name}</p>
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#E6EDF5", color: "#142852" }}>
                              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /> Match confirmé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#F3F4F6", color: "#6B7280" }}>
                              En attente de paiements
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{terrain.sport}</p>
                        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-4 w-4" strokeWidth={1.75} /> {slotLabel}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" strokeWidth={1.75} /> {terrain.city}
                          </span>
                        </div>
                        <p className="mt-2 font-extrabold text-lg" style={{ color: "#ed522a" }}>
                          {terrain.price} €
                        </p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} />
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleDelete(r.id, e)}
                    aria-label="Supprimer la réservation"
                    className="absolute top-3 right-12 h-8 w-8 rounded-full inline-flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              );
            })}

            <button
              onClick={() => toast.success("Rappel envoyé à tous les joueurs — ils recevront un SMS 24h avant le match")}
              className="w-full h-12 rounded-xl font-semibold inline-flex items-center justify-center gap-2 border-2 hover:bg-muted transition"
              style={{ borderColor: "#142852", color: "#142852" }}
            >
              <BellRing className="h-5 w-5" strokeWidth={1.75} />
              Envoyer un rappel aux joueurs
            </button>
          </div>
        )}
      </main>

      <AppFooter />
      <BottomNav active="reservations" />
    </div>
  );
}
