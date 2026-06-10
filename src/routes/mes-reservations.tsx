import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Calendar, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/mes-reservations")({
  head: () => ({
    meta: [
      { title: "Mes réservations — PlayOff Amateurs" },
      { name: "description", content: "Retrouvez toutes vos réservations de terrains." },
    ],
  }),
  component: MesReservationsPage,
});

type Reservation = {
  id: string;
  emoji: string;
  name: string;
  sport: string;
  when: string;
  city: string;
  price: number;
};

const DEFAULT_RESERVATIONS: Reservation[] = [
  {
    id: "r-1",
    emoji: "⚽",
    name: "Terrain Municipal Avon",
    sport: "Football 5v5",
    when: "Dim 31 mai · 18h – 19h",
    city: "Avon",
    price: 80,
  },
];

function MesReservationsPage() {
  const [reservations] = useState<Reservation[]>(DEFAULT_RESERVATIONS);

  return (
    <div className="min-h-screen pb-28 md:pb-12">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10 space-y-5">
        <h1 className="text-2xl sm:text-3xl font-bold">Mes réservations</h1>

        {reservations.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl px-6 py-12 text-center flex flex-col items-center gap-3">
            <div className="text-6xl" aria-hidden>📋</div>
            <h2 className="text-xl font-bold" style={{ color: "#0D1B4B" }}>
              Aucune réservation pour l'instant
            </h2>
            <p className="text-muted-foreground">Réserve un terrain pour commencer</p>
            <Link
              to="/terrains"
              className="mt-3 h-12 px-6 rounded-xl font-bold inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition text-white"
              style={{ background: "#0D1B4B" }}
            >
              Trouver un terrain
            </Link>
          </div>
        ) : (
          reservations.map((r) => (
            <Link
              key={r.id}
              to="/mon-match"
              className="block bg-card border border-border rounded-2xl p-4 hover:shadow-md hover:border-primary/30 transition"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-muted inline-flex items-center justify-center text-3xl shrink-0" aria-hidden>
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold">{r.name}</p>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: "#DCFCE7", color: "#15803D" }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /> Confirmée
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.sport}</p>
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" strokeWidth={1.75} /> {r.when}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" strokeWidth={1.75} /> {r.city}
                    </span>
                  </div>
                  <p className="mt-2 font-extrabold text-lg" style={{ color: "#FF6B00" }}>
                    {r.price} €
                  </p>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} />
              </div>
            </Link>
          ))
        )}
      </main>

      <BottomNav active="reservations" />
    </div>
  );
}
