import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, MapPin, Star, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

type Slot = { id: string; time: string; price: number | null; status: "available" | "full" };

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const FULL_DAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function formatLong(d: Date) {
  // ex: "Dimanche 31 mai 2026"
  const wd = FULL_DAYS_FR[(d.getDay() + 6) % 7];
  return `${wd} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}
function formatShort(d: Date) {
  // ex: "Dim. 31 mai 2026"
  const wd = DAY_LABELS[(d.getDay() + 6) % 7];
  return `${wd}. ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}
function nextHour(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Constantes fictives — créneaux par jour
const SLOTS_BY_DAY: Record<string, Slot[]> = {
  "2026-05-25": [
    { id: "a", time: "09:00", price: 35, status: "available" },
    { id: "b", time: "11:00", price: 40, status: "full" },
    { id: "c", time: "14:00", price: 40, status: "available" },
    { id: "d", time: "16:00", price: 50, status: "available" },
    { id: "e", time: "18:00", price: 60, status: "available" },
    { id: "f", time: "20:00", price: 60, status: "full" },
  ],
  "2026-05-26": [
    { id: "a", time: "10:00", price: 35, status: "available" },
    { id: "b", time: "12:00", price: 40, status: "available" },
    { id: "c", time: "15:00", price: 45, status: "full" },
    { id: "d", time: "17:00", price: 55, status: "available" },
    { id: "e", time: "19:00", price: 65, status: "available" },
    { id: "f", time: "21:00", price: 55, status: "available" },
  ],
  "2026-05-27": [
    { id: "a", time: "09:00", price: 30, status: "available" },
    { id: "b", time: "11:00", price: 35, status: "available" },
    { id: "c", time: "14:00", price: 40, status: "available" },
    { id: "d", time: "16:00", price: 45, status: "full" },
    { id: "e", time: "18:00", price: 55, status: "full" },
    { id: "f", time: "20:00", price: 50, status: "available" },
  ],
  "2026-05-28": [
    { id: "a", time: "10:00", price: 35, status: "available" },
    { id: "b", time: "13:00", price: 40, status: "available" },
    { id: "c", time: "15:00", price: 45, status: "available" },
    { id: "d", time: "17:00", price: 55, status: "available" },
    { id: "e", time: "19:00", price: 65, status: "full" },
    { id: "f", time: "21:00", price: 60, status: "available" },
  ],
  "2026-05-29": [
    { id: "a", time: "11:00", price: 40, status: "available" },
    { id: "b", time: "14:00", price: 45, status: "available" },
    { id: "c", time: "16:00", price: 50, status: "available" },
    { id: "d", time: "18:00", price: 70, status: "available" },
    { id: "e", time: "20:00", price: 80, status: "available" },
    { id: "f", time: "22:00", price: 60, status: "available" },
  ],
  "2026-05-30": [
    { id: "a", time: "09:00", price: 45, status: "available" },
    { id: "b", time: "11:00", price: 50, status: "full" },
    { id: "c", time: "13:00", price: 55, status: "available" },
    { id: "d", time: "15:00", price: 70, status: "available" },
    { id: "e", time: "17:00", price: 80, status: "full" },
    { id: "f", time: "19:00", price: 85, status: "available" },
  ],
  "2026-05-31": [
    { id: "a", time: "10:00", price: 40, status: "available" },
    { id: "b", time: "12:00", price: 40, status: "available" },
    { id: "c", time: "14:00", price: 80, status: "available" },
    { id: "d", time: "16:00", price: 80, status: "available" },
    { id: "e", time: "18:00", price: 90, status: "full" },
    { id: "f", time: "20:00", price: 70, status: "available" },
  ],
  "2026-06-01": [
    { id: "a", time: "09:00", price: 35, status: "available" },
    { id: "b", time: "11:00", price: 40, status: "available" },
    { id: "c", time: "14:00", price: 45, status: "full" },
    { id: "d", time: "16:00", price: 55, status: "available" },
    { id: "e", time: "18:00", price: 65, status: "available" },
    { id: "f", time: "20:00", price: 60, status: "available" },
  ],
  "2026-06-02": [
    { id: "a", time: "10:00", price: 40, status: "available" },
    { id: "b", time: "12:00", price: 45, status: "available" },
    { id: "c", time: "15:00", price: 50, status: "available" },
    { id: "d", time: "17:00", price: 60, status: "full" },
    { id: "e", time: "19:00", price: 70, status: "available" },
    { id: "f", time: "21:00", price: 60, status: "available" },
  ],
  "2026-06-03": [
    { id: "a", time: "09:00", price: 35, status: "full" },
    { id: "b", time: "11:00", price: 40, status: "available" },
    { id: "c", time: "14:00", price: 45, status: "available" },
    { id: "d", time: "16:00", price: 55, status: "available" },
    { id: "e", time: "18:00", price: 65, status: "available" },
    { id: "f", time: "20:00", price: 55, status: "available" },
  ],
  "2026-06-04": [
    { id: "a", time: "10:00", price: 40, status: "available" },
    { id: "b", time: "12:00", price: 45, status: "full" },
    { id: "c", time: "15:00", price: 50, status: "available" },
    { id: "d", time: "17:00", price: 60, status: "available" },
    { id: "e", time: "19:00", price: 70, status: "available" },
    { id: "f", time: "21:00", price: 60, status: "available" },
  ],
  "2026-06-05": [
    { id: "a", time: "11:00", price: 45, status: "available" },
    { id: "b", time: "14:00", price: 50, status: "available" },
    { id: "c", time: "16:00", price: 55, status: "available" },
    { id: "d", time: "18:00", price: 75, status: "available" },
    { id: "e", time: "20:00", price: 85, status: "available" },
    { id: "f", time: "22:00", price: 65, status: "available" },
  ],
  "2026-06-06": [
    { id: "a", time: "09:00", price: 50, status: "available" },
    { id: "b", time: "11:00", price: 55, status: "available" },
    { id: "c", time: "13:00", price: 60, status: "full" },
    { id: "d", time: "15:00", price: 75, status: "available" },
    { id: "e", time: "17:00", price: 85, status: "available" },
    { id: "f", time: "19:00", price: 90, status: "full" },
  ],
  "2026-06-07": [
    { id: "a", time: "10:00", price: 45, status: "available" },
    { id: "b", time: "12:00", price: 50, status: "available" },
    { id: "c", time: "14:00", price: 60, status: "available" },
    { id: "d", time: "16:00", price: 75, status: "available" },
    { id: "e", time: "18:00", price: 85, status: "full" },
    { id: "f", time: "20:00", price: 70, status: "available" },
  ],
  "2026-07-05": [
    { id: "a", time: "10:00", price: 50, status: "available" },
    { id: "b", time: "12:00", price: 55, status: "available" },
    { id: "c", time: "14:00", price: 60, status: "available" },
    { id: "d", time: "16:00", price: 70, status: "full" },
    { id: "e", time: "18:00", price: 80, status: "available" },
    { id: "f", time: "20:00", price: 75, status: "available" },
  ],
};

function SlotPage() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState<Date>(new Date(2026, 4, 25)); // Lun 25 mai 2026
  const [selectedDayISO, setSelectedDayISO] = useState<string>("2026-05-31");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("c");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!calendarOpen) return;
    const onClick = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [calendarOpen]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const slots = SLOTS_BY_DAY[selectedDayISO] ?? [];
  const selectedDate = new Date(selectedDayISO + "T00:00:00");
  const selectedSlot = slots.find((s) => s.id === selectedSlotId && s.status === "available");

  // Quand le jour change, si le slot sélectionné n'existe pas ou est complet, prendre le 1er dispo
  useEffect(() => {
    if (!slots.length) return;
    const current = slots.find((s) => s.id === selectedSlotId);
    if (!current || current.status === "full") {
      const firstAvailable = slots.find((s) => s.status === "available");
      if (firstAvailable) setSelectedSlotId(firstAvailable.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayISO]);

  const pickMonth = (year: number, month0: number) => {
    // place sur le 1er lundi du mois (ou 1er jour visible)
    const first = new Date(year, month0, 1);
    // recule jusqu'au lundi précédent (ou même jour si lundi)
    const dow = (first.getDay() + 6) % 7;
    const monday = addDays(first, -dow);
    setWeekStart(monday);
    // sélectionne le 1er jour ayant des créneaux dans cette semaine
    for (let i = 0; i < 7; i++) {
      const iso = toISO(addDays(monday, i));
      if (SLOTS_BY_DAY[iso]) {
        setSelectedDayISO(iso);
        break;
      }
    }
    setCalendarOpen(false);
  };

  const totalPrice = selectedSlot?.price ?? 0;
  const perPlayer = totalPrice ? (totalPrice / 10).toFixed(2).replace(".", ",") : "—";

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

          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center gap-3">
              <button
                onClick={() => setWeekStart((d) => addDays(d, -7))}
                className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition"
                aria-label="Semaine précédente"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <p className="font-semibold">{formatLong(selectedDate)}</p>
              <button
                onClick={() => setWeekStart((d) => addDays(d, 7))}
                className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition"
                aria-label="Semaine suivante"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="relative" ref={calendarRef}>
              <button
                onClick={() => setCalendarOpen((v) => !v)}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition"
              >
                <CalendarDays className="h-4 w-4" strokeWidth={1.75} /> Calendrier
              </button>
              {calendarOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-30 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="px-3 py-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">Mois</p>
                  <button
                    onClick={() => pickMonth(2026, 4)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium transition"
                  >
                    Mai 2026
                  </button>
                  <button
                    onClick={() => pickMonth(2026, 5)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium transition"
                  >
                    Juin 2026
                  </button>
                  <button
                    onClick={() => pickMonth(2026, 6)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium transition"
                  >
                    Juillet 2026
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {days.map((d) => {
              const iso = toISO(d);
              const active = iso === selectedDayISO;
              const dow = (d.getDay() + 6) % 7;
              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDayISO(iso)}
                  className={`flex flex-col items-center justify-center h-16 rounded-xl border text-sm transition ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wide opacity-80">{DAY_LABELS[dow]}</span>
                  <span className="font-bold text-base">{d.getDate()}</span>
                </button>
              );
            })}
          </div>

          {slots.length === 0 ? (
            <div className="mt-5 p-8 rounded-xl border border-dashed border-border text-center text-muted-foreground bg-card">
              Aucun créneau disponible ce jour.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map((s) => {
                const isFull = s.status === "full";
                const isSelected = selectedSlotId === s.id && !isFull;
                return (
                  <button
                    key={s.id}
                    disabled={isFull}
                    onClick={() => setSelectedSlotId(s.id)}
                    className={`relative h-24 rounded-xl border transition flex flex-col items-center justify-center gap-1 font-semibold ${
                      isFull
                        ? "bg-muted/60 border-border text-muted-foreground cursor-not-allowed"
                        : isSelected
                        ? "border-transparent text-accent-foreground shadow-sm"
                        : "bg-card border-border hover:border-primary/40 hover:shadow-sm"
                    }`}
                    style={isSelected ? { background: "#FF6B00" } : undefined}
                  >
                    <span className={`text-lg font-bold ${isFull ? "line-through" : ""}`}>
                      {s.time}
                    </span>
                    <span className="text-sm">
                      {isFull ? <span className="line-through">COMPLET</span> : `${s.price}€`}
                    </span>
                    {isSelected && (
                      <Check className="absolute bottom-1.5 h-4 w-4" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatShort(selectedDate)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Créneau</span>
              <span className="font-medium">
                {selectedSlot ? `${selectedSlot.time} – ${nextHour(selectedSlot.time)}` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-medium">1 heure</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Joueurs prévus</span>
              <span className="font-medium">10</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="font-semibold">Prix total</span>
              <span className="font-extrabold text-lg" style={{ color: "#FF6B00" }}>
                {selectedSlot ? `${totalPrice} €` : "—"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl p-4 text-center text-primary-foreground" style={{ background: "#0D1B4B" }}>
            <p className="text-sm opacity-90">Participation par joueur</p>
            <p className="text-2xl font-extrabold mt-1">{perPlayer} {selectedSlot ? "€" : ""}</p>
            <p className="text-xs opacity-75 mt-1">{selectedSlot ? `${totalPrice} € ÷ 10 joueurs` : "Sélectionnez un créneau"}</p>
          </div>

          <button
            onClick={() => navigate({ to: "/mon-match" })}
            disabled={!selectedSlot}
            className="w-full h-14 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
