import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Star, ChevronRight, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState } from "react";
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

const sports = ["Football 5v5", "Basket à 5", "Padel", "Tous sports"];

const terrains = [
  {
    id: 1,
    name: "Terrain Municipal Avon",
    distance: "2,3 km",
    rating: 4.6,
    reviews: 128,
    price: 40,
    available: true,
    image:
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=600&q=70",
  },
  {
    id: 2,
    name: "Complexe Sportif de Fontainebleau",
    distance: "3,8 km",
    rating: 4.3,
    reviews: 87,
    price: 45,
    available: true,
    image:
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=70",
  },
  {
    id: 3,
    name: "Stade Couvert de Nemours",
    distance: "5,2 km",
    rating: 4.8,
    reviews: 54,
    price: 50,
    available: false,
    image:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=70",
  },
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
  const [active, setActive] = useState("Football 5v5");

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
              className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-xl bg-card border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-base font-medium"
            />
          </div>
          <button className="h-12 sm:h-14 px-4 rounded-xl bg-primary/10 text-primary font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary/15 transition">
            <span aria-hidden>📍</span> Ma position
          </button>
          <button className="h-12 sm:h-14 w-12 sm:w-14 rounded-xl bg-card border border-border inline-flex items-center justify-center hover:bg-muted transition" aria-label="Filtres">
            <SlidersHorizontal className="h-5 w-5" strokeWidth={1.75} />
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
          {terrains.map((t) => {
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
