import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, MapPin, Star, Check } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/terrain/$id")({
  head: () => ({
    meta: [
      { title: "Choisir un créneau — PlayOff Amateurs" },
      { name: "description", content: "Sélectionnez un créneau pour réserver votre terrain." },
    ],
  }),
  component: SlotPage,
});

const days = [
  { day: "Lun", num: 25 },
  { day: "Mar", num: 26 },
  { day: "Mer", num: 27 },
  { day: "Jeu", num: 28 },
  { day: "Ven", num: 29 },
  { day: "Sam", num: 30 },
  { day: "Dim", num: 31 },
];

const slots = [
  { id: "a", time: "10:00", price: 40, status: "available" as const },
  { id: "b", time: "10:00", price: 40, status: "available" as const },
  { id: "c", time: "10:00", price: 40, status: "selected" as const },
  { id: "d", time: "10:00", price: 80, status: "available" as const },
  { id: "e", time: "10:00", price: null, status: "full" as const },
  { id: "f", time: "10:00", price: 40, status: "available" as const },
];

function SlotPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("c");
  const [selectedDay, setSelectedDay] = useState(31);

  return (
    <div className="min-h-screen pb-28 md:pb-12">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <section>
          <Link to="/terrains" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Terrains
          </Link>

          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold">Terrain Municipal Avon</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#22C55E", color: "#fff" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Disponible
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4" fill="#FACC15" stroke="#FACC15" strokeWidth={1.5} />
              <span className="text-foreground font-medium">4,6</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" strokeWidth={1.75} /> 2,3 km
            </span>
          </div>

          <p className="mt-6 text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Choisissez votre créneau
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-3">
              <button className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition" aria-label="Semaine précédente">
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <p className="font-semibold">Dimanche 31 mai 2026</p>
              <button className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition" aria-label="Semaine suivante">
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} /> Calendrier
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {days.map((d) => {
              const active = d.num === selectedDay;
              return (
                <button
                  key={d.num}
                  onClick={() => setSelectedDay(d.num)}
                  className={`flex flex-col items-center justify-center h-16 rounded-xl border text-sm transition ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wide opacity-80">{d.day}</span>
                  <span className="font-bold text-base">{d.num}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((s) => {
              const isFull = s.status === "full";
              const isSelected = selected === s.id;
              return (
                <button
                  key={s.id}
                  disabled={isFull}
                  onClick={() => setSelected(s.id)}
                  className={`relative h-24 rounded-xl border transition flex flex-col items-center justify-center gap-1 font-semibold ${
                    isFull
                      ? "bg-muted/60 border-border text-muted-foreground cursor-not-allowed"
                      : isSelected
                      ? "border-transparent text-accent-foreground shadow-sm"
                      : "bg-card border-border hover:border-primary/40 hover:shadow-sm"
                  }`}
                  style={isSelected && !isFull ? { background: "#FF6B00" } : undefined}
                >
                  <span className={`text-lg font-bold ${isFull ? "line-through" : ""}`}>
                    {s.time}
                  </span>
                  <span className="text-sm">
                    {isFull ? <span className="line-through">COMPLET</span> : `${s.price}€`}
                  </span>
                  {isSelected && !isFull && (
                    <Check className="absolute bottom-1.5 h-4 w-4" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 self-start space-y-3">
          <h2 className="font-bold text-lg">Récapitulatif</h2>

          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 inline-flex items-center justify-center text-xl" aria-hidden>⚽</div>
              <div>
                <p className="font-bold leading-tight">Terrain Municipal Avon</p>
                <p className="text-sm text-muted-foreground">Football 5v5 · 📍 2 km</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            {[
              ["Date", "Dim. 31 mai 2026"],
              ["Créneau", "14:00 – 15:00"],
              ["Durée", "1 heure"],
              ["Joueurs prévus", "10"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="font-semibold">Prix total</span>
              <span className="font-extrabold text-lg" style={{ color: "#FF6B00" }}>80 €</span>
            </div>
          </div>

          <div className="rounded-2xl p-4 text-center text-primary-foreground" style={{ background: "#0D1B4B" }}>
            <p className="text-sm opacity-90">Participation par joueur</p>
            <p className="text-2xl font-extrabold mt-1">8,00 €</p>
            <p className="text-xs opacity-75 mt-1">80 € ÷ 10 joueurs</p>
          </div>

          <button
            onClick={() => navigate({ to: "/mon-match" })}
            className="w-full h-14 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition"
            style={{ background: "#FF6B00", color: "#1A1A1A" }}
          >
            <CalendarDays className="h-5 w-5" strokeWidth={2} /> Réserver ce créneau
          </button>
        </aside>
      </main>

      <BottomNav active="reservations" />
    </div>
  );
}
