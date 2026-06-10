import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, MapPin, Star, Check, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/terrain/$id")({
  head: () => ({
    meta: [
      { title: "Choisir un créneau — PlayOff Amateurs" },
      { name: "description", content: "Sélectionnez un créneau pour réserver votre terrain." },
    ],
  }),
  component: SlotPage,
});

type Slot = { id: string; time: string; price: number; status: "available" | "full" };
type Terrain = {
  id: string; nom: string; sport: "football" | "basket" | "padel"; ville: string;
  distance_km: number | null; note: number | null; image_url: string | null;
};
type Creneau = { id: string; date_debut: string; date_fin: string; prix_total: number; statut: string };

const SPORT_LABEL: Record<string, string> = { football: "Football 5v5", basket: "Basket à 5", padel: "Padel" };
const SPORT_EMOJI: Record<string, string> = { football: "⚽", basket: "🏀", padel: "🎾" };
const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const FULL_DAYS_FR = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function startOfDay(d: Date) { const r = new Date(d); r.setHours(0,0,0,0); return r; }
function mondayOf(d: Date) { return addDays(startOfDay(d), -((d.getDay()+6)%7)); }
function diffDays(a: Date, b: Date) { return Math.round((startOfDay(a).getTime()-startOfDay(b).getTime())/86400000); }
function formatLong(d: Date) { return `${FULL_DAYS_FR[(d.getDay()+6)%7]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`; }
function formatShort(d: Date) { return `${DAY_LABELS[(d.getDay()+6)%7]}. ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`; }
function nextHour(t: string) { const [h,m] = t.split(":").map(Number); return `${String((h+1)%24).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }

function SlotPage() {
  const { id } = useParams({ from: "/terrain/$id" });
  const navigate = useNavigate();
  const { user } = useAuth();

  const [terrain, setTerrain] = useState<Terrain | null>(null);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerCount, setPlayerCount] = useState(10);
  const [booking, setBooking] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addDays(today, 29), [today]);
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(today));
  const [selectedDayISO, setSelectedDayISO] = useState<string>(() => toISO(today));
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("terrains").select("*").eq("id", id).maybeSingle(),
      supabase.from("creneaux").select("*").eq("terrain_id", id)
        .gte("date_debut", today.toISOString())
        .lte("date_debut", addDays(today, 30).toISOString())
        .order("date_debut", { ascending: true }),
    ]).then(([tRes, cRes]) => {
      if (tRes.error || cRes.error) {
        toast.error("Connexion impossible — réessaie dans un instant");
      }
      setTerrain(tRes.data as Terrain | null);
      setCreneaux((cRes.data ?? []) as Creneau[]);
      setLoading(false);
    });
  }, [id, today]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const slots: Slot[] = useMemo(() => {
    return creneaux
      .filter((c) => toISO(new Date(c.date_debut)) === selectedDayISO)
      .map((c) => {
        const d = new Date(c.date_debut);
        return {
          id: c.id,
          time: `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`,
          price: c.prix_total,
          status: c.statut === "disponible" ? "available" : "full",
        };
      });
  }, [creneaux, selectedDayISO]);

  const selectedDate = new Date(selectedDayISO + "T00:00:00");
  const selectedSlot = slots.find((s) => s.id === selectedSlotId && s.status === "available");
  const dayAvailable = slots.some((s) => s.status === "available");

  useEffect(() => {
    if (!slots.length) { setSelectedSlotId(null); return; }
    const current = slots.find((s) => s.id === selectedSlotId);
    if (!current || current.status === "full") {
      const first = slots.find((s) => s.status === "available");
      setSelectedSlotId(first ? first.id : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayISO, creneaux]);

  const canPrevWeek = diffDays(weekStart, mondayOf(today)) > 0;
  const canNextWeek = diffDays(addDays(weekStart, 7), maxDate) <= 0;

  const goToday = () => { setSelectedDayISO(toISO(today)); setWeekStart(mondayOf(today)); setCalendarOpen(false); };
  const onPickDate = (d: Date | undefined) => {
    if (!d) return;
    setSelectedDayISO(toISO(d));
    setWeekStart(mondayOf(d));
    setCalendarOpen(false);
  };

  const totalPrice = selectedSlot?.price ?? 0;
  const perPlayerValue = totalPrice && playerCount > 0 ? Math.ceil(totalPrice/playerCount) : 0;
  const perPlayerRounded = totalPrice > 0 && totalPrice % playerCount !== 0;
  const perPlayer = totalPrice && playerCount > 0 ? String(perPlayerValue) : "—";

  const handlePayment = async (provider: "stripe" | "paypal") => {
    if (!selectedSlot || !terrain) return;
    if (!user) {
      toast.info("Connecte-toi pour réserver");
      navigate({ to: "/connexion", search: { mode: "login", redirect: window.location.pathname } });
      return;
    }
    setBooking(true);
    const { data: resa, error: resaErr } = await supabase
      .from("reservations")
      .insert({
        user_id: user.id,
        creneau_id: selectedSlot.id,
        terrain_id: terrain.id,
        prix_paye: totalPrice,
        statut: "confirmee",
      })
      .select()
      .single();

    if (resaErr || !resa) {
      setBooking(false);
      toast.error("Réservation impossible — réessaie dans un instant");
      return;
    }

    const joueurs = Array.from({ length: playerCount }, (_, i) => ({
      reservation_id: resa.id,
      prenom: i === 0 ? "Vous" : `Joueur ${i + 1}`,
      statut_paiement: i === 0 ? "paye" : "en_attente",
      est_organisateur: i === 0,
    }));
    await supabase.from("joueurs_match").insert(joueurs);

    setBooking(false);
    toast.success(`Paiement ${provider === "stripe" ? "Stripe" : "PayPal"} confirmé ✅ Réservation enregistrée`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-28 md:pb-12">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-4">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded-2xl" />
        </main>
        <BottomNav active="reservations" />
      </div>
    );
  }

  if (!terrain) {
    return (
      <div className="min-h-screen pb-28 md:pb-12">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12 text-center">
          <p className="text-lg font-semibold">Terrain introuvable</p>
          <Link to="/terrains" className="mt-4 inline-block text-primary underline">Retour aux terrains</Link>
        </main>
      </div>
    );
  }

  const distance = terrain.distance_km != null ? `${String(terrain.distance_km).replace(".", ",")} km` : "—";
  const emoji = SPORT_EMOJI[terrain.sport] ?? "🏟️";
  const sportLabel = SPORT_LABEL[terrain.sport] ?? terrain.sport;

  return (
    <div className="min-h-screen pb-28 md:pb-12">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <section>
          <Link to="/terrains" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Terrains
          </Link>

          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold">{terrain.nom}</h1>
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
              <span className="text-foreground font-medium">{Number(terrain.note ?? 0).toFixed(1).replace(".", ",")}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" strokeWidth={1.75} /> {distance} · {terrain.ville}
            </span>
          </div>

          <p className="mt-6 text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Choisissez votre créneau
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center gap-3">
              <button onClick={() => canPrevWeek && setWeekStart((d) => addDays(d, -7))} disabled={!canPrevWeek}
                className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Semaine précédente">
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <p className="font-semibold">{formatLong(selectedDate)}</p>
              <button onClick={() => canNextWeek && setWeekStart((d) => addDays(d, 7))} disabled={!canNextWeek}
                className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Semaine suivante">
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
                  <button onClick={goToday} className="w-full h-10 rounded-lg font-semibold text-sm hover:opacity-95 transition"
                    style={{ background: "#FF6B00", color: "#1A1A1A" }}>
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
              const dow = (d.getDay()+6)%7;
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
                  <button key={s.id} disabled={isFull} onClick={() => setSelectedSlotId(s.id)}
                    className={`relative h-24 rounded-xl border transition flex flex-col items-center justify-center gap-1 font-semibold ${
                      isFull ? "bg-muted/60 border-border text-muted-foreground cursor-not-allowed"
                      : isSelected ? "border-transparent text-accent-foreground shadow-sm"
                      : "bg-card border-border hover:border-primary/40 hover:shadow-sm"
                    }`}
                    style={isSelected ? { background: "#FF6B00" } : undefined}>
                    <span className={`text-lg font-bold ${isFull ? "line-through" : ""}`}>{s.time}</span>
                    <span className="text-sm">{isFull ? <span className="line-through">COMPLET</span> : `${s.price}€`}</span>
                    {isSelected && <Check className="absolute bottom-1.5 h-4 w-4" strokeWidth={3} />}
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
              <div className="h-10 w-10 rounded-full bg-primary/10 inline-flex items-center justify-center text-xl" aria-hidden>{emoji}</div>
              <div>
                <p className="font-bold leading-tight">{terrain.nom}</p>
                <p className="text-sm text-muted-foreground">{sportLabel} · 📍 {distance}</p>
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
                <button type="button" onClick={() => setPlayerCount((n) => Math.max(1, n-1))} disabled={playerCount<=1}
                  className="h-8 w-8 rounded-full border border-border inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Retirer un joueur">
                  <Minus className="h-4 w-4" strokeWidth={2} />
                </button>
                <span className="font-semibold w-6 text-center">{playerCount}</span>
                <button type="button" onClick={() => setPlayerCount((n) => Math.min(10, n+1))} disabled={playerCount>=10}
                  className="h-8 w-8 rounded-full border border-border inline-flex items-center justify-center hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Ajouter un joueur">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
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
            <p className="text-xs opacity-75 mt-1">{selectedSlot ? `${totalPrice} € ÷ ${playerCount} joueur${playerCount>1?"s":""}` : "Sélectionnez un créneau"}</p>
          </div>

          {playerCount < 10 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground transition-all duration-200">
              Il manque {10 - playerCount} joueur{10 - playerCount > 1 ? "s" : ""} pour réserver
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3 transition-all duration-200">
              <p className="font-bold text-center" style={{ color: "#0D1B4B" }}>
                Équipe complète ! Choisissez votre mode de paiement
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handlePayment("stripe")} disabled={!selectedSlot || booking}
                  className="h-12 rounded-xl font-bold inline-flex items-center justify-center gap-2 text-white hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#635BFF" }}>
                  💳 Stripe
                </button>
                <button onClick={() => handlePayment("paypal")} disabled={!selectedSlot || booking}
                  className="h-12 rounded-xl font-bold inline-flex items-center justify-center gap-2 text-white hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#003087" }}>
                  🅿️ PayPal
                </button>
              </div>
            </div>
          )}
        </aside>
      </main>

      <BottomNav active="reservations" />
    </div>
  );
}
