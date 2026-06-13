import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, CalendarDays, ClipboardList, User } from "lucide-react";
import { toast } from "sonner";

export function BottomNav({ active: _ }: { active: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = {
    terrains:     pathname.startsWith("/terrain"),
    matches:      pathname === "/mon-match",
    reservations: pathname === "/mes-reservations",
    profil:       false,
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-40">
      <ul className="flex items-stretch justify-around max-w-md mx-auto">
        <li className="flex-1">
          <Link to="/terrains" className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs"
            style={{ color: isActive.terrains ? "#FF6B00" : "#1A1A1A" }}>
            <MapPin className="h-6 w-6" strokeWidth={1.75} />
            <span style={{ fontWeight: isActive.terrains ? 600 : 500 }}>Terrains</span>
          </Link>
        </li>
        <li className="flex-1">
          <Link to="/mon-match" className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs"
            style={{ color: isActive.matches ? "#FF6B00" : "#1A1A1A" }}>
            <CalendarDays className="h-6 w-6" strokeWidth={1.75} />
            <span style={{ fontWeight: isActive.matches ? 600 : 500 }}>Mon match</span>
          </Link>
        </li>
        <li className="flex-1">
          <Link to="/mes-reservations" className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs"
            style={{ color: isActive.reservations ? "#FF6B00" : "#1A1A1A" }}>
            <ClipboardList className="h-6 w-6" strokeWidth={1.75} />
            <span style={{ fontWeight: isActive.reservations ? 600 : 500 }}>Réservations</span>
          </Link>
        </li>
        <li className="flex-1">
          <button
            onClick={() => toast.info("Profil — disponible après connexion")}
            className="w-full flex flex-col items-center justify-center gap-1 py-2.5 text-xs"
            style={{ color: "#1A1A1A" }}>
            <User className="h-6 w-6" strokeWidth={1.75} />
            <span style={{ fontWeight: 500 }}>Profil</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
