import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, MapPin, Star, Check, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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

const BASE_TIMES = ["09:00", "11:00", "14:00", "16:00", "18:00", "20:00"] as const;
const BASE_PRICES = [35, 40, 45, 55, 65, 60];

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function mondayOf(d: Date) {
  const dow = (d.getDay() + 6) % 7;
  return addDays(startOfDay(d), -dow);
}
function diffDays(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000);
}

function buildSlotsForDay(dayIndex: number): Slot[] {
  return BASE_TIMES.map((time, i) => {
    // déterministe : ~20% complets
    const full = (dayIndex * 7 + i * 3) % 5 === 0;
    const priceVar = ((dayIndex + i) % 4) * 5;
    return {
      id: String.fromCharCode(97 + i),
      time,
      price: BASE_PRICES[i] + priceVar,
      status: full ? "full" : "available",
    };
  });
}

const TERRAIN_DATA: Record<string, { name: string; sport: string; distance: string; rating: number; emoji: string }> = {
  "1":  { name: "Terrain Municipal Avon",           sport: "Football 5v5", distance: "2,3 km", rating: 4.6, emoji: "⚽" },
  "2":  { name: "Complexe Sportif de Fontainebleau", sport: "Football 5v5", distance: "3,8 km", rating: 4.3, emoji: "⚽" },
  "11": { name: "Stade Jean Bouin Melun",            sport: "Football 5v5", distance: "4,1 km", rating: 4.4, emoji: "⚽" },
  "12": { name: "City Stade de Barbizon",            sport: "Football 5v5", distance: "6,7 km", rating: 4.2, emoji: "⚽" },
  "21": { name: "Gymnase Avon Centre",               sport: "Basket à 5",  distance: "1,8 km", rating: 4.5, emoji: "🏀" },
  "22": { name: "Salle Polyvalente Fontainebleau",   sport: "Basket à 5",  distance: "3,2 km", rating: 4.1, emoji: "🏀" },
  "24": { name: "Gymnase Léo Lagrange",              sport: "Basket à 5",  distance: "4,7 km", rating: 4.3, emoji: "🏀" },
  "25": { name: "Complexe Bois-le-Roi",              sport: "Basket à 5",  distance: "7,4 km", rating: 4.0, emoji: "🏀" },
  "31": { name: "Club Padel Avon",                   sport: "Padel",        distance: "2,9 km", rating: 4.7, emoji: "🎾" },
  "32": { name: "Padel Arena Fontainebleau",         sport: "Padel",        distance: "4,4 km", rating: 4.5, emoji: "🎾" },
  "34": { name: "Padel Indoor Melun",                sport: "Padel",        distance: "5,8 km", rating: 4.6, emoji: "🎾" },
  "35": { name: "Padel Garden Barbizon",             sport: "Padel",        distance: "6,9 km", rating: 4.4, emoji: "🎾" },
};

const DEFAULT_TERRAIN = { name: "Terrain Municipal Avon", sport: "Football 5v5", distance: "2,3 km", rating: 4.6, emoji: "⚽" };

function SlotPage() {
  const { id } = useParams({ from: "/terrain/$id" });
  const terrain = TERRAIN_DATA[id] ?? DEFAULT_TERRAIN;
  const [playerCount, setPlayerCount] = useState(10);

  // Aujourd'hui figé au mount + fenêtre 30 jours
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addDays(today, 29), [today]);

  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(today));
  const [selectedDayISO, setSelectedDayISO] = useState<string>(() => toISO(today));
  const [selectedSlotId, setSelectedSlotId] = useState<string>("a");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // Construit créneaux pour le jour sélectionné si dans la fenêtre 30 jours
  const slots = useMemo(() => {
    const d = new Date(selectedDayISO + "T00:00:00");
    const idx = diffDays(d, today);
    if (idx < 0 || idx > 29) return [];
    return buildSlotsForDay(idx);
  }, [selectedDayISO, today]);

  const selectedDate = new Date(selectedDayISO + "T00:00:00");
  const selectedSlot = slots.find((s) => s.id === selectedSlotId && s.status === "available");
  const dayAvailable = slots.some((s) => s.status === "available");

  // Si jour change, recale slot sélectionné si complet/inexistant
  useEffect(() => {
    if (!slots.length) return;
    const current = slots.find((s) => s.id === selectedSlotId);
    if (!current || current.status === "full") {
      const firstAvailable = slots.find((s) => s.status === "available");
      if (firstAvailable) setSelectedSlotId(firstAvailable.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayISO]);

  // Bornes navigation semaine
  const canPrevWeek = diffDays(weekStart, mondayOf(today)) > 0;
  const canNextWeek = diffDays(addDays(weekStart, 7), maxDate) <= 0;

  const goToday = () => {
    setSelectedDayISO(toISO(today));
    setWeekStart(mondayOf(today));
    setCalendarOpen(false);
  };

  const onPickDate = (d: Date | undefined) => {
    if (!d) return;
    const iso = toISO(d);
    setSelectedDayISO(iso);
    setWeekStart(mondayOf(d));
    setCalendarOpen(false);
  };

  const totalPrice = selectedSlot?.price ?? 0;
  const perPlayer = totalPrice && playerCount > 0 ? (totalPrice / playerCount).toFixed(2).replace(".", ",") : "—";

  return (
    <div className="min-h-screen pb-28 md:pb-12">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <section>
          <Link to="/terrains" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Terrains
          </Link>

          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold">{terrain.name}</h1>
            {dayAvailable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#22C55E", color: "#fff" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#9CA3AF", color: "#fff" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Complet ce jour
              </span>
            )}
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
                onClick={() => canPrevWeek && setWeekStart((d) => addDays(d, -7))}
                disabled={!canPrevWeek}
                className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Semaine précédente"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <p className="font-semibold">{formatLong(selectedDate)}</p>
              <button
                onClick={() => canNextWeek && setWeekStart((d) => addDays(d, 7))}
                disabled={!canNextWeek}
                className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Semaine suivante"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition">
                  <CalendarDays className="h-4 w-4" strokeWidth={1.75} /> Calendrier
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-2 border-b border-border">
                  <button
                    onClick={goToday}
                    className="w-full h-10 rounded-lg font-semibold text-sm hover:opacity-95 transition"
                    style={{ background: "#FF6B00", color: "#1A1A1A" }}
                  >
                    Aujourd'hui
                  </button>
                </div>
                <CalendarUI
                  mode="single"
                  selected={selectedDate}
                  onSelect={onPickDate}
                  disabled={{ before: today, after: maxDate }}
                  defaultMonth={selectedDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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
              <div className="h-10 w-10 rounded-full bg-primary/10 inline-flex items-center justify-center text-xl" aria-hidden>{terrain.emoji}</div>
              <div>
                <p className="font-bold leading-tight">{terrain.name}</p>
                <p className="text-sm text-muted-foreground">{terrain.sport} · 📍 {terrain.distance}</p>
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
