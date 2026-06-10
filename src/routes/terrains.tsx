import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Star, ChevronRight, Search, Calendar, ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/terrains")({
  head: () => ({
    meta: [
      { title: "Trouvez un terrain — PlayOff Amateurs" },
      { name: "description", content: "Liste de terrains sportifs disponibles près de chez vous." },
    ],
  }),
  component: TerrainsPage,
});

const sports = ["Tous sports", "Football 5v5", "Basket à 5", "Padel"] as const;
type Sport = (typeof sports)[number];

const SPORT_MAP: Record<string, Exclude<Sport, "Tous sports">> = {
  football: "Football 5v5",
  basket: "Basket à 5",
  padel: "Padel",
};

type TerrainRow = {
  id: string;
  nom: string;
  sport: "football" | "basket" | "padel";
  ville: string;
  code_postal: string;
  distance_km: number | null;
  prix_heure: number;
  note: number | null;
  nb_avis: number;
  disponible: boolean;
  image_url: string | null;
};

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Note ${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4" strokeWidth={1.5}
          fill={i < full ? "#FACC15" : "transparent"}
          stroke={i < full ? "#FACC15" : "#CBD5E1"} />
      ))}
    </span>
  );
}

function TerrainsPage() {
  const [active, setActive] = useState<Sport>("Football 5v5");
  const [showAll, setShowAll] = useState(false);
  const [villeQuery, setVilleQuery] = useState("");
  const [villeSuggestions, setVilleSuggestions] = useState<string[]>([]);
  const villeRef = useRef<HTMLDivElement>(null);
  const [terrains, setTerrains] = useState<TerrainRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("terrains").select("*").order("note", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Connexion impossible — réessaie dans un instant");
        } else {
          setTerrains((data ?? []) as TerrainRow[]);
        }
        setLoading(false);
      });
  }, []);

  const villes = useMemo(() => {
    const set = new Set(terrains.map((t) => `${t.ville} (${t.code_postal})`));
    return Array.from(set);
  }, [terrains]);

  const filtered = useMemo(() => {
    let list = terrains;
    if (active !== "Tous sports") {
      const sportKey = Object.entries(SPORT_MAP).find(([, v]) => v === active)?.[0];
      list = list.filter((t) => t.sport === sportKey);
    }
    if (villeQuery.trim().length >= 2) {
      const q = villeQuery.toLowerCase();
      list = list.filter((t) => `${t.ville} ${t.code_postal}`.toLowerCase().includes(q));
    }
    return list;
  }, [terrains, active, villeQuery]);

  const visible = showAll ? filtered : filtered.slice(0, 3);

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Trouvez un terrain près de chez vous
        </h1>

        <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1" ref={villeRef}>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" strokeWidth={1.75} />
            <input
              value={villeQuery}
              onChange={(e) => {
                const q = e.target.value;
                setVilleQuery(q);
                if (q.length >= 2) {
                  setVilleSuggestions(villes.filter((v) => v.toLowerCase().includes(q.toLowerCase())).slice(0, 6));
                } else {
                  setVilleSuggestions([]);
                }
              }}
              onBlur={() => setTimeout(() => setVilleSuggestions([]), 150)}
              aria-label="Ville"
              placeholder="Ville ou code postal"
              className="w-full h-12 sm:h-14 pl-12 pr-9 rounded-xl bg-card border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-base font-medium"
            />
            {villeQuery && (
              <button
                onMouseDown={(e) => { e.preventDefault(); setVilleQuery(""); setVilleSuggestions([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-muted inline-flex items-center justify-center text-muted-foreground"
                aria-label="Effacer"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
            {villeSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-30 overflow-hidden">
                {villeSuggestions.map((v) => (
                  <li key={v}>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); setVilleQuery(v); setVilleSuggestions([]); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-muted transition flex items-center gap-2"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.75} />
                      {v}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            <input
              type="text"
              defaultValue="Cette semaine"
              aria-label="Date"
              readOnly
              onClick={() => toast.info("Choisissez la date sur la page du terrain")}
              className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-xl bg-card border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-base font-medium cursor-pointer"
            />
          </div>
          <button
            onClick={() => toast.info("Recherche en cours...")}
            className="h-12 sm:h-14 px-5 rounded-xl font-bold inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition"
            style={{ background: "#FF6B00", color: "#1A1A1A" }}
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" strokeWidth={2} />
            <span className="sm:hidden">Rechercher</span>
          </button>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {sports.map((s) => {
            const isActive = s === active;
            return (
              <button
                key={s}
                onClick={() => { setActive(s); setShowAll(false); }}
                className={`shrink-0 h-10 px-4 rounded-full text-sm font-semibold border transition ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {loading ? (
          <ul className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="h-28 sm:h-32 rounded-2xl bg-muted animate-pulse" />
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <div className="mt-8 p-8 rounded-2xl border border-dashed border-border text-center text-muted-foreground bg-card">
            Aucun terrain trouvé pour ces critères.
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {visible.map((t) => {
              const distance = t.distance_km != null ? `${String(t.distance_km).replace(".", ",")} km` : "—";
              const rating = Number(t.note ?? 0);
              const Wrapper: typeof Link | "div" = t.disponible ? Link : "div";
              const wrapperProps = t.disponible
                ? { to: "/terrain/$id", params: { id: t.id } }
                : { "aria-disabled": true };
              return (
                <li key={t.id}>
                  {/* @ts-expect-error union props */}
                  <Wrapper
                    {...wrapperProps}
                    className={`group flex items-stretch gap-4 bg-card rounded-2xl border border-border overflow-hidden transition shadow-sm ${
                      t.disponible ? "hover:shadow-md hover:border-primary/30 cursor-pointer" : "opacity-90"
                    }`}
                  >
                    <div
                      className="w-28 sm:w-44 shrink-0 bg-muted bg-cover bg-center"
                      style={{ backgroundImage: t.image_url ? `url(${t.image_url})` : undefined }}
                      aria-hidden
                    />
                    <div className="flex-1 min-w-0 py-3 sm:py-4 pr-3 sm:pr-5 flex flex-col gap-1.5">
                      <h3 className="font-bold text-base sm:text-lg truncate">{t.nom}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" strokeWidth={1.75} /> {distance} · {t.ville}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Stars rating={rating} />
                          <span className="font-medium text-foreground/80">{rating.toFixed(1).replace(".", ",")}</span>
                          <span>({t.nb_avis})</span>
                        </span>
                        {t.disponible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#22C55E", color: "#fff" }}>
                            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#9CA3AF", color: "#fff" }}>
                            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Complet
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm sm:text-base mt-1">
                        À partir de <span className="text-foreground">{t.prix_heure} €</span> / h
                      </p>
                    </div>
                    <div className="flex items-center pr-3 sm:pr-5 text-muted-foreground group-hover:text-primary transition">
                      <ChevronRight className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                  </Wrapper>
                </li>
              );
            })}
          </ul>
        )}

        {filtered.length > 3 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                if (showAll) {
                  setShowAll(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  setShowAll(true);
                }
              }}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border-2 bg-card font-semibold hover:bg-muted transition"
              style={{ borderColor: "#0D1B4B", color: "#0D1B4B" }}
            >
              {showAll ? (
                <>Voir moins de terrains <ChevronUp className="h-4 w-4" strokeWidth={2} /></>
              ) : (
                <>Voir plus de terrains <ChevronDown className="h-4 w-4" strokeWidth={2} /></>
              )}
            </button>
          </div>
        )}
      </main>

      <BottomNav active="terrains" />
    </div>
  );
}
