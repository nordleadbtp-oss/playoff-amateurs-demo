import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Star, ChevronRight, Search, Calendar, ChevronDown, ChevronUp, X, ArrowUpDown, LocateFixed } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { AppFooter } from "@/components/AppFooter";

const courtBasket1 = "/court-basket-1.jpg";
const courtBasket2 = "/court-basket-2.jpg";
const courtBasket3 = "/court-basket-3.jpg";
const courtPadel1 = "/court-padel-1.jpg";
const courtPadel2 = "/court-padel-2.jpg";
const courtPadel3 = "/court-padel-3.jpg";

export const Route = createFileRoute("/terrains")({
  head: () => ({
    meta: [
      { title: "Trouvez un terrain â€” PlayOff Amateurs" },
      { name: "description", content: "Liste de terrains sportifs disponibles prÃ¨s de chez vous." },
    ],
  }),
  component: TerrainsPage,
});

const sports = ["Tous sports", "Football 5v5", "Basket Ã  5", "Padel"] as const;
type Sport = (typeof sports)[number];

const VILLES_IDF = [
  "Avon (77310)", "Fontainebleau (77300)", "Melun (77000)", "Barbizon (77630)",
  "Nemours (77140)", "Moret-sur-Loing (77250)", "Bois-le-Roi (77590)",
  "Milly-la-ForÃªt (91490)", "Ã‰tampes (91150)", "Ã‰vry-Courcouronnes (91000)",
  "Corbeil-Essonnes (91100)", "Lieusaint (77127)", "Pontault-Combault (77340)",
  "Meaux (77100)", "Provins (77160)", "Chelles (77500)", "Lagny-sur-Marne (77400)",
  "Noisiel (77186)", "Torcy (77200)", "Lognes (77185)",
  "Paris (75001)", "Vincennes (94300)", "CrÃ©teil (94000)", "Montreuil (93100)",
  "Saint-Denis (93200)", "Bobigny (93000)", "Versailles (78000)",
];

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
  // Football primaires (3)
  { id: 1,  name: "Terrain Municipal Avon",            sport: "Football 5v5", distance: "2,3 km", rating: 4.6, reviews: 128, price: 70, available: true,  primary: true, image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=600&q=70" },
  { id: 2,  name: "Complexe Sportif de Fontainebleau", sport: "Football 5v5", distance: "3,8 km", rating: 4.3, reviews: 87,  price: 75, available: true,  primary: true, image: "https://images.unsplash.com/photo-1510051640316-cee39563ddab?auto=format&fit=crop&w=600&q=70" },
  { id: 3,  name: "Stade Couvert de Nemours",          sport: "Football 5v5", distance: "5,2 km", rating: 4.8, reviews: 54,  price: 80, available: false, primary: true, image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=600&q=70" },
  // Football secondaires
  { id: 11, name: "Stade Jean Bouin Melun",            sport: "Football 5v5", distance: "4,1 km", rating: 4.4, reviews: 62,  price: 72, available: true,                 image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=600&q=70" },
  { id: 12, name: "City Stade de Barbizon",            sport: "Football 5v5", distance: "6,7 km", rating: 4.2, reviews: 41,  price: 65, available: true,                 image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=70" },
  { id: 13, name: "Terrain SynthÃ©tique Moret",         sport: "Football 5v5", distance: "8,3 km", rating: 4.0, reviews: 29,  price: 68, available: false,                image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=70" },
  // Basket primaires (3)
  { id: 21, name: "Gymnase Avon Centre",               sport: "Basket Ã  5",  distance: "1,8 km", rating: 4.5, reviews: 73,  price: 30, available: true,  primary: true, image: courtBasket1 },
  { id: 22, name: "Salle Polyvalente Fontainebleau",   sport: "Basket Ã  5",  distance: "3,2 km", rating: 4.1, reviews: 55,  price: 28, available: true,  primary: true, image: courtBasket2 },
  { id: 23, name: "Playground Nemours Sud",            sport: "Basket Ã  5",  distance: "6,1 km", rating: 3.9, reviews: 33,  price: 32, available: false, primary: true, image: courtBasket3 },
  // Basket secondaires
  { id: 24, name: "Gymnase LÃ©o Lagrange",              sport: "Basket Ã  5",  distance: "4,7 km", rating: 4.3, reviews: 48,  price: 29, available: true,                 image: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?auto=format&fit=crop&w=600&q=70" },
  { id: 25, name: "Complexe Bois-le-Roi",              sport: "Basket Ã  5",  distance: "7,4 km", rating: 4.0, reviews: 36,  price: 27, available: true,                 image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=70" },
  { id: 26, name: "Halle des Sports Moret",            sport: "Basket Ã  5",  distance: "9,1 km", rating: 4.2, reviews: 25,  price: 33, available: false,                image: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?auto=format&fit=crop&w=600&q=70" },
  // Padel primaires (3)
  { id: 31, name: "Club Padel Avon",                   sport: "Padel",       distance: "2,9 km", rating: 4.7, reviews: 91,  price: 25, available: true,  primary: true, image: courtPadel1 },
  { id: 32, name: "Padel Arena Fontainebleau",         sport: "Padel",       distance: "4,4 km", rating: 4.5, reviews: 67,  price: 22, available: true,  primary: true, image: courtPadel2 },
  { id: 33, name: "Padel Club Moret",                  sport: "Padel",       distance: "7,2 km", rating: 4.3, reviews: 48,  price: 27, available: false, primary: true, image: courtPadel3 },
  // Padel secondaires
  { id: 34, name: "Padel Indoor Melun",                sport: "Padel",       distance: "5,8 km", rating: 4.6, reviews: 54,  price: 26, available: true,                 image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&h=400&q=70" },
  { id: 35, name: "Padel Garden Barbizon",             sport: "Padel",       distance: "6,9 km", rating: 4.4, reviews: 38,  price: 24, available: true,                 image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&h=400&q=70" },
  { id: 36, name: "Padel Center Nemours",              sport: "Padel",       distance: "8,5 km", rating: 4.2, reviews: 29,  price: 28, available: false,                image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&h=400&q=70" },
];

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
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "price">("distance");
  const [locating, setLocating] = useState(false);
  const [geoActive, setGeoActive] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    setGeoActive(false);
    setTimeout(() => {
      setVilleQuery("Avon (77310)");
      setVilleSuggestions([]);
      setSortBy("distance");
      setShowAll(false);
      setLocating(false);
      setGeoActive(true);
      toast.success("Position dÃ©tectÃ©e â€” terrains triÃ©s par proximitÃ©");
    }, 1200);
  };
  const [villeQuery, setVilleQuery] = useState("Avon (77310)");
  const [villeSuggestions, setVilleSuggestions] = useState<string[]>([]);
  const villeRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const list = active === "Tous sports" ? [...terrains] : terrains.filter((t) => t.sport === active);
    return [...list].sort((a, b) => {
      if (sortBy === "distance") return parseFloat(a.distance) - parseFloat(b.distance);
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price") return a.price - b.price;
      return 0;
    });
  }, [active, sortBy]);

  const visible = showAll ? filtered : filtered.slice(0, 3);

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Trouvez un terrain prÃ¨s de chez vous
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
                  setVilleSuggestions(VILLES_IDF.filter((v) => v.toLowerCase().includes(q.toLowerCase())).slice(0, 6));
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
              defaultValue="Dim 31 mai 2026"
              aria-label="Date"
              readOnly
              onClick={() => toast.info("SÃ©lection de date (dÃ©mo)")}
              className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-xl bg-card border border-border outline-none text-base font-medium cursor-pointer"
            />
          </div>
          <button
            onClick={handleLocate}
            disabled={locating}
            className="h-12 sm:h-14 w-12 sm:w-auto px-0 sm:px-4 rounded-xl font-bold inline-flex items-center justify-center gap-2 border-2 bg-card hover:bg-muted transition disabled:opacity-60"
            style={geoActive ? { borderColor: "#22C55E", color: "#15803D" } : { borderColor: "#0D1B4B", color: "#0D1B4B" }}
            aria-label="Me localiser"
          >
            <LocateFixed className={`h-5 w-5 ${locating ? "animate-spin" : ""}`} strokeWidth={2} />
            <span className="hidden sm:inline whitespace-nowrap">
              {locating ? "Localisation..." : geoActive ? "LocalisÃ© âœ“" : "Me localiser"}
            </span>
          </button>
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

        <div className="mt-5 flex gap-2 overflow-x-auto -mx-1 px-1">
          {sports.map((s) => {
            const isActive = s === active;
            return (
              <button
                key={s}
                onClick={() => { setActive(s); setShowAll(false); }}
                className={`shrink-0 h-10 px-4 rounded-full text-sm font-semibold border transition ${
                  isActive ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{filtered.length} terrain{filtered.length > 1 ? "s" : ""} trouvÃ©{filtered.length > 1 ? "s" : ""}</p>
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 h-10">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as "distance" | "rating" | "price"); setShowAll(false); }}
              className="text-sm font-semibold bg-transparent outline-none cursor-pointer pr-1"
              aria-label="Trier par"
            >
              <option value="distance">Distance</option>
              <option value="rating">Note</option>
              <option value="price">Prix</option>
            </select>
          </div>
        </div>

        <ul className="mt-3 space-y-4">
          {visible.map((t) => (
            <li key={t.id}>
              {t.available ? (
                <Link
                  to="/terrain/$id"
                  params={{ id: String(t.id) }}
                  className="group flex items-stretch gap-4 bg-card rounded-2xl border border-border overflow-hidden transition shadow-sm hover:shadow-md hover:border-primary/30 cursor-pointer"
                >
                  <div className="w-28 sm:w-44 shrink-0 bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${t.image})` }} aria-hidden />
                  <div className="flex-1 min-w-0 py-3 sm:py-4 pr-3 sm:pr-5 flex flex-col gap-1.5">
                    <h3 className="font-bold text-base sm:text-lg truncate" style={{ color: "#1A1A1A" }}>{t.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" strokeWidth={1.75} /> {t.distance}</span>
                      <span className="inline-flex items-center gap-1">
                        <Stars rating={t.rating} />
                        <span className="font-medium text-foreground/80">{t.rating.toString().replace(".", ",")}</span>
                        <span>({t.reviews})</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#22C55E", color: "#fff" }}>
                        <span className="h-1.5 w-1.5 rounded-full bg-white" /> Disponible
                      </span>
                    </div>
                    <p className="font-semibold text-sm sm:text-base mt-1">Ã€ partir de <span className="text-foreground">{t.price} â‚¬</span> / h</p>
                  </div>
                  <div className="flex items-center pr-3 sm:pr-5 text-muted-foreground group-hover:text-primary transition">
                    <ChevronRight className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                </Link>
              ) : (
                <div
                  aria-disabled={true}
                  className="group flex items-stretch gap-4 bg-card rounded-2xl border border-border overflow-hidden transition shadow-sm opacity-90"
                >
                  <div className="w-28 sm:w-44 shrink-0 bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${t.image})` }} aria-hidden />
                  <div className="flex-1 min-w-0 py-3 sm:py-4 pr-3 sm:pr-5 flex flex-col gap-1.5">
                    <h3 className="font-bold text-base sm:text-lg truncate" style={{ color: "#1A1A1A" }}>{t.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" strokeWidth={1.75} /> {t.distance}</span>
                      <span className="inline-flex items-center gap-1">
                        <Stars rating={t.rating} />
                        <span className="font-medium text-foreground/80">{t.rating.toString().replace(".", ",")}</span>
                        <span>({t.reviews})</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#9CA3AF", color: "#fff" }}>
                        <span className="h-1.5 w-1.5 rounded-full bg-white" /> Complet ce soir
                      </span>
                    </div>
                    <p className="font-semibold text-sm sm:text-base mt-1">Ã€ partir de <span className="text-foreground">{t.price} â‚¬</span> / h</p>
                  </div>
                  <div className="flex items-center pr-3 sm:pr-5 text-muted-foreground transition">
                    <ChevronRight className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {filtered.length > 3 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => { if (showAll) { setShowAll(false); window.scrollTo({ top: 0, behavior: "smooth" }); } else { setShowAll(true); } }}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border-2 bg-card font-semibold hover:bg-muted transition"
              style={{ borderColor: "#0D1B4B", color: "#0D1B4B" }}
            >
              {showAll ? (<>Voir moins de terrains <ChevronUp className="h-4 w-4" strokeWidth={2} /></>) : (<>Voir plus de terrains <ChevronDown className="h-4 w-4" strokeWidth={2} /></>)}
            </button>
          </div>
        )}
      </main>

      <AppFooter />
      <BottomNav active="terrains" />
    </div>
  );
}





