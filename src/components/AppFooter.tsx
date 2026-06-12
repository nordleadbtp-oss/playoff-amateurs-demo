import { toast } from "sonner";

const links = [
  { label: "Mentions légales" },
  { label: "CGV" },
  { label: "Contact" },
];

export function AppFooter() {
  return (
    <footer className="pb-20 md:pb-4 border-t border-primary/20 text-primary-foreground/70" style={{ background: "#0D1B4B" }}>
      <div className="flex flex-col items-center gap-3 py-5 md:flex-row md:justify-center md:gap-6 md:py-4">
        <div className="flex items-center gap-4 md:gap-6">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => toast.info(`${l.label} — page non disponible en démo`)}
              className="text-xs font-medium text-white/70 hover:text-white transition"
            >
              {l.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-white/50">© 2026 PlayOff Amateurs</span>
      </div>
    </footer>
  );
}
