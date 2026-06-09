import { Link, useRouterState } from "@tanstack/react-router";
import { Map, Calendar, ClipboardList, Bell } from "lucide-react";
import logoAsset from "@/assets/playoff-logo.png.asset.json";

const links = [
  { to: "/terrains", label: "Terrains", icon: Map },
  { to: "/mon-match", label: "Mes matches", icon: Calendar },
  { to: "/mon-match", label: "Mes réservations", icon: ClipboardList, match: "reservations" },
] as const;

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link to="/terrains" className="flex items-center shrink-0">
          <img src={logoAsset.url} alt="PlayOff Amateurs" className="h-10 sm:h-14 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l, i) => {
            const Icon = l.icon;
            const active =
              (i === 0 && pathname.startsWith("/terrain")) ||
              (i === 1 && pathname === "/mon-match");
            return (
              <Link
                key={i}
                to={l.to}
                className="relative flex items-center gap-2 py-2 text-base font-semibold transition-opacity hover:opacity-100"
                style={{ opacity: active ? 1 : 0.85 }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                <span>{l.label}</span>
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <button className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 transition" aria-label="Notifications">
            <Bell className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <Link
            to="/connexion"
            className="h-10 w-10 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center text-sm hover:opacity-90 transition"
            aria-label="Mon profil"
          >
            TD
          </Link>
        </div>
      </div>
    </header>
  );
}
