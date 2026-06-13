import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, CalendarDays, ClipboardList, User } from "lucide-react";
import { toast } from "sonner";

const items = [
  { to: "/terrains",         label: "Terrains",      icon: MapPin,       match: (p: string) => p.startsWith("/terrain") },
  { to: "/mon-match",        label: "Mon match",     icon: CalendarDays, match: (p: string) => p === "/mon-match" },
  { to: "/mes-reservations", label: "Réservations",  icon: ClipboardList,match: (p: string) => p === "/mes-reservations" },
  { to: null,                label: "Profil",        icon: User,         match: (p: string) => p === "/connexion" },
] as const;

export function BottomNav({ active: _ }: { active: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-40">
      <ul className="flex items-stretch justify-around max-w-md mx-auto">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = it.match(pathname);
          const inner = (
            <>
              <Icon className="h-6 w-6" strokeWidth={1.75} />
              <span style={{ fontWeight: isActive ? 600 : 500 }}>{it.label}</span>
            </>
          );
          return (
            <li key={it.label} className="flex-1">
              {it.to ? (
                <Link
                  to={it.to}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs"
                  style={{ color: isActive ? "#FF6B00" : "#1A1A1A" }}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  onClick={() => toast.info("Profil — fonctionnalité disponible après connexion")}
                  className="w-full flex flex-col items-center justify-center gap-1 py-2.5 text-xs"
                  style={{ color: "#1A1A1A" }}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
