import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, MapPin, Star, Check, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
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

type Slot = { id: string; time: string; price: number; status: "available" | "full"; happyHour?: boolean };

const TERRAIN_DATA: Record<string, { name: string; sport: string; distance: string; rating: number; emoji: string; price: number }> = {
  "1":  { name: "Terrain Municipal Avon",            sport: "Football 5v5", distance: "2,3 km", rating: 4.6, emoji: "⚽", price: 70 },
  "2":  { name: "Complexe Sportif de Fontainebleau", sport: "Football 5v5", distance: "3,8 km", rating: 4.3, emoji: "⚽", price: 75 },
  "3":  { name: "Stade Couvert de Nemours",          sport: "Football 5v5", distance: "5,2 km", rating: 4.8, emoji: "⚽", price: 80 },
  "11": { name: "Stade Jean Bouin Melun",             sport: "Football 5v5", distance: "4,1 km", rating: 4.4, emoji: "⚽", price: 72 },
  "12": { name: "City Stade de Barbizon",             sport: "Football 5v5", distance: "6,7 km", rating: 4.2, emoji: "⚽", price: 65 },
  "13": { name: "Terrain Synthétique Moret",          sport: "Football 5v5", distance: "8,3 km", rating: 4.0, emoji: "⚽", price: 68 },
  "21": { name: "Gymnase Avon Centre",                sport: "Basket à 5",  distance: "1,8 km", rating: 4.5, emoji: "🏀", price: 30 },
  "22": { name: "Salle Polyvalente Fontainebleau",    sport: "Basket à 5",  distance: "3,2 km", rating: 4.1, emoji: "🏀", price: 28 },
  "23": { name: "Playground Nemours Sud",             sport: "Basket à 5",  distance: "6,1 km", rating: 3.9, emoji: "🏀", price: 32 },
  "24": { name: "Gymnase Léo Lagrange",               sport: "Basket à 5",  distance: "4,7 km", rating: 4.3, emoji: "🏀", price: 29 },
  "25": { name: "Complexe Bois-le-Roi",               sport: "Basket à 5",  distance: "7,4 km", rating: 4.0, emoji: "🏀", price: 27 },
  "26": { name: "Halle des Sports Moret",             sport: "Basket à 5",  distance: "9,1 km", rating: 4.2, emoji: "🏀", price: 33 },
  "31": { name: "Club Padel Avon",                    sport: "Padel",       distance: "2,9 km", rating: 4.7, emoji: "🎾", price: 25 },
  "32": { name: "Padel Arena Fontainebleau",          sport: "Padel",       distance: "4,4 km", rating: 4.5, emoji: "🎾", price: 22 },
  "33": { name: "Padel Club Moret",                   sport: "Padel",       distance: "7,2 km", rating: 4.3, emoji: "🎾", price: 27 },
  "34": { name: "Padel Indoor Melun",                 sport: "Padel",       distance: "5,8 km", rating: 4.6, emoji: "🎾", price: 26 },
  "35": { name: "Padel Garden Barbizon",              sport: "Padel",       distance: "6,9 km", rating: 4.4, emoji: "🎾", price: 24 },
  "36": { name: "Padel Center Nemours",               sport: "Padel",       distance: "8,5 km", rating: 4.2, emoji: "🎾", price: 28 },
};
const DEFAULT_TERRAIN = { name: "Terrain Municipal Avon", sport: "Football 5v5", distance: "2,3 km", rating: 4.6, emoji: "⚽", price: 80 };

const SLOTS_BY_DOW: Record<number, Omit<Slot, "price">[]> = {
  // Lundi
  0: [{ id: "s1", time: "09:00", status: "available" }, { id: "s2", time: "11:00", status: "full" }, { id: "s3", time: "12:00", status: "available", happyHour: true }, { id: "s3b", time: "14:00", status: "available", happyHour: true }, { id: "s4", time: "16:00", status: "available" }, { id: "s5", time: "18:00", status: "full" }, { id: "s6", time: "20:00", status: "available" }],
  // Mardi
  1: [{ id: "s7", time: "10:00", status: "available" }, { id: "s8", time: "12:00", status: "available", happyHour: true }, { id: "s8b", time: "14:00", status: "available", happyHour: true }, { id: "s9", time: "15:00", status: "full" }, { id: "s10", time: "17:00", status: "available" }, { id: "s11", time: "19:00", status: "available" }],
  // Mercredi
  2: [{ id: "s12", time: "08:00", status: "available" }, { id: "s13", time: "10:00", status: "available" }, { id: "s14", time: "12:00", status: "available", happyHour: true }, { id: "s14b", time: "14:00", status: "available", happyHour: true }, { id: "s15", time: "16:00", status: "full" }, { id: "s16", time: "20:00", status: "available" }],
  // Jeudi
  3: [{ id: "s17", time: "09:00", status: "full" }, { id: "s18", time: "11:00", status: "available" }, { id: "s18b", time: "12:00", status: "available", happyHour: true }, { id: "s19", time: "14:00", status: "available", happyHour: true }, { id: "s19b", time: "18:00", status: "available" }, { id: "s20", time: "20:00", status: "available" }],
  // Vendredi
  4: [{ id: "s21", time: "12:00", status: "available", happyHour: true }, { id: "s22", time: "14:00", status: "available", happyHour: true }, { id: "s23", time: "17:00", status: "full" }, { id: "s24", time: "19:00", status: "available" }, { id: "s25", time: "21:00", status: "available" }],
  // Samedi — pas de Happy Hour
  5: [{ id: "s26", time: "09:00", status: "available" }, { id: "s27", time: "11:00", status: "available" }, { id: "s28", time: "13:00", status: "full" }, { id: "s29", time: "15:00", status: "available" }, { id: "s30", time: "17:00", status: "available" }, { id: "s31", time: "19:00", status: "full" }],
  // Dimanche — pas de Happy Hour
  6: [{ id: "s32", time: "10:00", status: "available" }, { id: "s33", time: "14:00", status: "available" }, { id: "s34", time: "16:00", status: "available" }, { id: "s35", time: "18:00", status: "full" }],
};

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const FULL_DAYS_FR = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function startOfDay(d: Date) { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; }
function mondayOf(d: Date) { return addDays(startOfDay(d), -((d.getDay() + 6) % 7)); }
function diffDays(a: Date, b: Date) { return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000); }
function toISO(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function formatLong(d: Date) { return `${FULL_DAYS_FR[(d.getDay()+6)%7]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`; }
function formatShort(d: Date) { return `${DAY_LABELS[(d.getDay()+6)%7]}. ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`; }
function nextHour(t: string) { const [h, m] = t.split(":").map(Number); return `${String((h+1)%24).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }

function SlotPage() {
  const { id } = useParams({ from: "/terrain/$id" });
  const navigate = useNavigate();
  const terrain = TERRAIN_DATA[id] ?? DEFAULT_TERRAIN;

  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addDays(today, 29), [today]);
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(today));
  const [selectedDayISO, setSelectedDayISO] = useState<string>(() => toISO(today));
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const selectedDate = new Date(selectedDayISO + "T00:00:00");

  const isFootball = terrain.sport === "Football 5v5";
  const HAPPY_HOUR_PRICE = 50;

  const slots: Slot[] = useMemo(() => {
    const dow = (selectedDate.getDay() + 6) % 7;
    return (SLOTS_BY_DOW[dow] ?? []).map((s) => ({
      ...s,
      price: s.happyHour && isFootball ? HAPPY_HOUR_PRICE : terrain.price,
    }));
  }, [selectedDayISO, terrain.price]);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId && s.status === "available");
  const dayAvailable = slots.some((s) => s.status === "available");
  const canPrevWeek = diffDays(weekStart, mondayOf(today)) > 0;
  const canNextWeek = diffDays(addDays(weekStart, 7), maxDate) <= 0;

  const goToday = () => { setSelectedDayISO(toISO(today)); setWeekStart(mondayOf(today)); setCalendarOpen(false); };
  const onPickDate = (d: Date | undefined) => { if (!d) return; setSelectedDayISO(toISO(d)); setWeekStart(mondayOf(d)); setCalendarOpen(false); };

  const totalPrice = selectedSlot?.price ?? 0;
  const pricePerPlayer = playerCount > 0 && totalPrice > 0 ? Math.ceil(totalPrice / playerCount) : 0;
  const isExact = totalPrice > 0 && totalPrice % playerCount === 0;

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
              <span className="text-foreground font-medium">{terrain.rating.toFixed(1).replace(".", ",")}</span>
            </span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" strokeWidth={1.75} /> {terrain.distance}</span>
          </div>

          <p className="mt-6 text-xs font-bold tracking-widest text-muted-foreground uppercase">Choisissez votre créneau</p>

          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center gap-3">
              <button onClick={() => canPrevWeek && setWeekStart((d) => addDays(d, -7))} disabled={!canPrevWeek}
                className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <p className="font-semibold">{formatLong(selectedDate)}</p>
              <button onClick={() => canNextWeek && setWeekStart((d) => addDays(d, 7))} disabled={!canNextWeek}
                className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed">
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
                  <button onClick={goToday} className="w-full h-10 rounded-lg font-semibold text-sm hover:opacity-95 transition" style={{ background: "#FF6B00", color: "#1A1A1A" }}>
                    Aujourd'hui
                  </button>
                </div>
                <CalendarUI mode="single" selected={selectedDate} onSelect={onPickDate}
                  disabled={{ before: today, after: maxDate }} defaultMonth={selectedDate} initialFocus
                  className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {days.map((d) => {
              const iso = toISO(d);
              const active = iso === selectedDayISO;
              const dow = (d.getDay() + 6) % 7;
              const inRange = diffDays(d, today) >= 0 && diffDays(d, maxDate) <= 0;
              return (
                <button key={iso} onClick={() => inRange && setSelectedDayISO(iso)} disabled={!inRange}
                  className={`flex flex-col items-center justify-center h-16 rounded-xl border text-sm transition ${
                    active ? "bg-primary text-primary-foreground border-primary"
                    : inRange ? "bg-card border-border hover:bg-muted"
                    : "bg-muted/50 border-border opacity-50 cursor-not-allowed"
                  }`}>
                  <span className="text-[11px] uppercase tracking-wide opacity-80">{DAY_LABELS[dow]}</span>
                  <span className="font-bold text-base">{d.getDate()}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((s) => {
              const isFull = s.status === "full";
              const isSelected = selectedSlotId === s.id && !isFull;
              return (
                <button key={s.id} disabled={isFull} onClick={() => setSelectedSlotId(s.id)}
                  className={`relative h-24 rounded-xl border transition flex flex-col items-center justify-center gap-1 font-semibold ${
                    isFull ? "bg-muted/60 border-border text-muted-foreground cursor-not-allowed"
                    : isSelected ? "border-transparent text-accent-foreground shadow-sm"
                    : s.happyHour && isFootball ? "bg-amber-50 border-amber-300 hover:border-amber-400 hover:shadow-sm"
                    : "bg-card border-border hover:border-primary/40 hover:shadow-sm"
                  }`}
                  style={isSelected ? { background: "#FF6B00" } : undefined}>
                  {s.happyHour && isFootball && !isFull && (
                    <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background: "#F59E0B", color: "#fff" }}>
                      ⚡ Happy Hour
                    </span>
                  )}
                  <span className={`text-lg font-bold ${isFull ? "line-through" : ""}`}>{s.time}</span>
                  <span className="text-sm">{isFull ? <span className="line-through">COMPLET</span> : `${s.price} €`}</span>
                  {isSelected && <Check className="absolute bottom-1.5 h-4 w-4" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 self-start space-y-3">
          <h2 className="font-bold text-lg">Récapitulatif</h2>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 inline-flex items-center justify-center text-xl">{terrain.emoji}</div>
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
              <span className="font-medium">{selectedSlot ? `${selectedSlot.time} – ${nextHour(selectedSlot.time)}` : "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-medium">1 heure</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Joueurs prévus</span>
              <div className="inline-flex items-center gap-2">
                <button type="button" onClick={() => setPlayerCount((n) => Math.max(1, n - 1))} disabled={playerCount <= 1}
                  className="h-8 w-8 rounded-full border border-border inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed">
                  <Minus className="h-4 w-4" strokeWidth={2} />
                </button>
                <span className="font-semibold w-6 text-center">{playerCount}</span>
                <button type="button" onClick={() => setPlayerCount((n) => Math.min(10, n + 1))} disabled={playerCount >= 10}
                  className="h-8 w-8 rounded-full border border-border inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="font-semibold">Prix total</span>
              <span className="font-extrabold text-lg" style={{ color: "#FF6B00" }}>{selectedSlot ? `${totalPrice} €` : "—"}</span>
            </div>
          </div>
          <div className="rounded-2xl p-4 text-center text-primary-foreground" style={{ background: "#0D1B4B" }}>
            <p className="text-sm opacity-90">Participation par joueur</p>
            <p className="text-2xl font-extrabold mt-1">
              {totalPrice > 0 ? `${pricePerPlayer} €` : "—"}
              {totalPrice > 0 && !isExact && <span className="text-sm font-normal opacity-75 ml-1">(arrondi)</span>}
            </p>
            <p className="text-xs opacity-75 mt-1">
              {totalPrice > 0 ? `${totalPrice} € ÷ ${playerCount} joueur${playerCount > 1 ? "s" : ""}` : "Sélectionnez un créneau"}
            </p>
          </div>
          <button
            disabled={!selectedSlot}
            onClick={() => {
              toast.success("Créneau sélectionné — organisez votre match !");
              navigate({
                to: "/mon-match",
                search: {
                  terrainId: id,
                  slot: selectedSlot!.time,
                  date: selectedDayISO,
                },
              });
            }}
            className="w-full h-14 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#FF6B00", color: "#1A1A1A" }}
          >
            {selectedSlot ? `Réserver · ${totalPrice} €` : "Sélectionnez un créneau"}
          </button>
          {playerCount < 10 && selectedSlot && (
            <p className="text-center text-xs text-muted-foreground">
              Vous pouvez ajouter les {10 - playerCount} autres joueur{10 - playerCount > 1 ? "s" : ""} après la réservation
            </p>
          )}
        </aside>
      </main>
      <BottomNav active="reservations" />
    </div>
  );
}

