import { Link, useRouterState } from "@tanstack/react-router";
import { Map, Calendar, ClipboardList, Bell, Menu, X, LogIn, HelpCircle, Globe, Smartphone } from "lucide-react";
import { useState } from "react";


const links = [
  { to: "/terrains", label: "Terrains", icon: Map },
  { to: "/mon-match", label: "Mon match", icon: Calendar },
  { to: "/mes-reservations", label: "Mes réservations", icon: ClipboardList },
] as const;

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [notif, setNotif] = useState(true);

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center shrink-0">
          <img src="/playoff-logo.png" alt="PlayOff Amateurs" className="h-10 sm:h-12 w-auto" />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l, i) => {
            const Icon = l.icon;
            const active =
              (i === 0 && pathname.startsWith("/terrain")) ||
              (i === 1 && pathname === "/mon-match") ||
              (i === 2 && pathname === "/mes-reservations");
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

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 transition" aria-label="Notifications">
            <Bell className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 transition"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-[88%] max-w-sm bg-card text-foreground shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-5 h-16 border-b border-border">
              <p className="font-bold text-lg">Menu</p>
              <button onClick={() => setMenuOpen(false)} className="h-10 w-10 rounded-full hover:bg-muted inline-flex items-center justify-center" aria-label="Fermer">
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <Link to="/connexion" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 h-12 rounded-xl hover:bg-muted transition">
                <LogIn className="h-5 w-5" strokeWidth={1.75} />
                <span className="font-medium">Se connecter / S'inscrire</span>
              </Link>
              <Link to="/mes-reservations" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 h-12 rounded-xl hover:bg-muted transition">
                <ClipboardList className="h-5 w-5" strokeWidth={1.75} />
                <span className="font-medium">Mes réservations</span>
              </Link>
              <div className="flex items-center gap-3 px-3 h-12 rounded-xl">
                <Bell className="h-5 w-5" strokeWidth={1.75} />
                <span className="font-medium flex-1">Notifications</span>
                <button
                  onClick={() => setNotif((v) => !v)}
                  className="relative w-11 h-6 rounded-full transition"
                  style={{ background: notif ? "#22C55E" : "#CBD5E1" }}
                  aria-label="Toggle notifications"
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                    style={{ left: notif ? "22px" : "2px" }}
                  />
                </button>
              </div>
              <div className="px-3 py-3 rounded-xl">
                <div className="flex items-center gap-3 mb-1">
                  <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
                  <span className="font-medium">Besoin d'aide</span>
                </div>
                <p className="text-sm text-muted-foreground pl-8">support@playoffamateurs.fr</p>
              </div>
              <div className="flex items-center gap-3 px-3 h-12 rounded-xl">
                <Globe className="h-5 w-5" strokeWidth={1.75} />
                <span className="font-medium flex-1">Langue</span>
                <span className="text-sm text-muted-foreground">FranÃ§ais</span>
              </div>
            </div>
            <div className="p-4 border-t border-border">
              <div className="rounded-2xl p-4 text-primary-foreground" style={{ background: "#0D1B4B" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="h-5 w-5" strokeWidth={1.75} />
                  <p className="font-bold">TÃ©lÃ©charger l'app</p>
                </div>
                <p className="text-sm opacity-85">RÃ©serve un terrain encore plus vite</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}

