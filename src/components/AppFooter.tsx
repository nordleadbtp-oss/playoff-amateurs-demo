import { toast } from "sonner";

const links = [
  { label: "Mentions légales" },
  { label: "CGV" },
  { label: "Contact" },
];

export function AppFooter() {
  return (
    <footer className="hidden md:flex items-center justify-center gap-6 py-4 border-t border-border text-xs text-muted-foreground">
      {links.map((l) => (
        <button
          key={l.label}
          onClick={() => toast.info(`${l.label} — page non disponible en démo`)}
          className="hover:text-foreground transition"
        >
          {l.label}
        </button>
      ))}
      <span>© 2026 PlayOff Amateurs</span>
    </footer>
  );
}
