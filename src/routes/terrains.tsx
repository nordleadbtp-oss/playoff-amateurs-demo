import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Star, ChevronRight, Search, Calendar, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

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

type Terrain = {
  id: number;
  name: string;
  sport: Exclude<Sport, "Tous sports">;
  distance: string;
  rating: number;
  reviews: number;
  price: number;
  available: boolean;
  image: string;
  primary?: boolean;
};

const terrains: Terrain[] = [
  // Originaux (v1) — affichés en premier
  { id: 1, name: "Terrain Municipal Avon", sport: "Football 5v5", distance: "2,3 km", rating: 4.6, reviews: 128, price: 40, available: true, primary: true, image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=600&q=70" },
  { id: 2, name: "Complexe Sportif de Fontainebleau", sport: "Football 5v5", distance: "3,8 km", rating: 4.3, reviews: 87, price: 45, available: true, primary: true, image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=70" },
  { id: 3, name: "Stade Couvert de Nemours", sport: "Football 5v5", distance: "5,2 km", rating: 4.8, reviews: 54, price: 50, available: false, primary: true, image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=70" },
  // Football 5v5
  { id: 11, name: "Stade Jean Bouin Melun", sport: "Football 5v5", distance: "4,1 km", rating: 4.4, reviews: 62, price: 38, available: true, image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=600&q=70" },
  { id: 12, name: "City Stade de Barbizon", sport: "Football 5v5", distance: "6,7 km", rating: 4.2, reviews: 41, price: 35, available: true, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=70" },
  { id: 13, name: "Terrain Synthétique Moret", sport: "Football 5v5", distance: "8,3 km", rating: 4.0, reviews: 29, price: 42, available: false, image: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=600&q=70" },
  // Basket à 5
  { id: 21, name: "Gymnase Avon Centre", sport: "Basket à 5", distance: "1,8 km", rating: 4.5, reviews: 73, price: 30, available: true, image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=70" },
  { id: 22, name: "Salle Polyvalente Fontainebleau", sport: "Basket à 5", distance: "3,2 km", rating: 4.1, reviews: 55, price: 28, available: true, image: "https://images.unsplash.com/photo-1518614846876-7e40c8b1f8ef?auto=format&fit=crop&w=600&q=70" },
  { id: 23, name: "Complexe Nemours Sud", sport: "Basket à 5", distance: "6,1 km", rating: 3.9, reviews: 33, price: 32, available: false, image: "https://images.unsplash.com/photo-1505666287802-931582b5470c?auto=format&fit=crop&w=600&q=70" },
  // Padel
  { id: 31, name: "Club Padel Avon", sport: "Padel", distance: "2,9 km", rating: 4.7, reviews: 91, price: 25, available: true, image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=70" },
  { id: 32, name: "Padel Arena Fontainebleau", sport: "Padel", distance: "4,4 km", rating: 4.5, reviews: 67, price: 22, available: true, image: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=600&q=70" },
  { id: 33, name: "Padel Club Moret", sport: "Padel", distance: "7,2 km", rating: 4.3, reviews: 48, price: 27, available: false, image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=70" },
];

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Note ${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          strokeWidth={1.5}
          fill={i < full ? "#FACC15" : "transparent"}
          stroke={i < full ? "#FACC15" : "#CBD5E1"}
        />
      ))}
    </span>
  );
}

function TerrainsPage() {
  const [active, setActive] = useState<Sport>("Football 5v5");

  const filtered = useMemo(() => {
    if (active === "Tous sports") {
      const primaries = terrains.filter((t) => t.primary);
      const rest = terrains.filter((t) => !t.primary);
      return [...primaries, ...rest];
    }
    const list = terrains.filter((t) => t.sport === active);
    // primary first
    return [...list.filter((t) => t.primary), ...list.filter((t) => !t.primary)];
  }, [active]);

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Trouvez un terrain près de chez vous
        </h1>

        <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            <input
              defaultValue="Avon (77310)"
              aria-label="Ville"
              className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-xl bg-card border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-base font-medium"
            />
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            <input
              type="text"
              defaultValue="Dim 31 mai 2026"
              aria-label="Date"
              readOnly
              onClick={() => toast.info("Calendrier ouvert")}
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
                onClick={() => setActive(s)}
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

        <ul className="mt-6 space-y-4">
          {filtered.map((t) => {
            const Wrapper: typeof Link | "div" = t.available ? Link : "div";
            const wrapperProps = t.available
              ? { to: "/terrain/$id", params: { id: String(t.id) } }
              : { "aria-disabled": true };
            return (
              <li key={t.id}>
                {/* @ts-expect-error union props */}
                <Wrapper
                  {...wrapperProps}
                  className={`group flex items-stretch gap-4 bg-card rounded-2xl border border-border overflow-hidden transition shadow-sm ${
                    t.available ? "hover:shadow-md hover:border-primary/30 cursor-pointer" : "opacity-90"
                  }`}
                >
                  <div
                    className="w-28 sm:w-44 shrink-0 bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${t.image})` }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0 py-3 sm:py-4 pr-3 sm:pr-5 flex flex-col gap-1.5">
                    <h3 className="font-bold text-base sm:text-lg truncate">{t.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" strokeWidth={1.75} /> {t.distance}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Stars rating={t.rating} />
                        <span className="font-medium text-foreground/80">{t.rating.toString().replace(".", ",")}</span>
                        <span>({t.reviews})</span>
                      </span>
                      {t.available ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#22C55E", color: "#fff" }}>
                          <span className="h-1.5 w-1.5 rounded-full bg-white" /> Disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#9CA3AF", color: "#fff" }}>
                          <span className="h-1.5 w-1.5 rounded-full bg-white" /> Complet ce soir
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm sm:text-base mt-1">
                      À partir de <span className="text-foreground">{t.price} €</span> / h
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

        <button className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4 hover:text-primary transition">
          Voir plus de terrains <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </button>
      </main>

      <BottomNav active="terrains" />
    </div>
  );
}
