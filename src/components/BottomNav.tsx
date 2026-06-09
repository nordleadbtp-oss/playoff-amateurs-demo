import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, CalendarDays, ClipboardList, User } from "lucide-react";

const items = [
  { to: "/terrains", label: "Terrains", icon: MapPin, key: "terrains" },
  { to: "/mon-match", label: "Matches", icon: CalendarDays, key: "matches" },
  { to: "/mon-match", label: "Réservations", icon: ClipboardList, key: "reservations" },
  { to: "/connexion", label: "Profil", icon: User, key: "profil" },
] as const;

export function BottomNav({ active }: { active: "terrains" | "matches" | "reservations" | "profil" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-40">
      <ul className="flex items-stretch justify-around max-w-md mx-auto">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = it.key === active || (it.key === "profil" && pathname === "/connexion");
          return (
            <li key={it.key} className="flex-1">
              <Link
                to={it.to}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs"
                style={{ color: isActive ? "#FF6B00" : "#1A1A1A" }}
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} />
                <span style={{ fontWeight: isActive ? 600 : 500 }}>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
