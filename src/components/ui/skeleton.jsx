import WareTrackLogo from "./WareTrackLogo";

function Spinner({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 select-none">
      {/* Ring */}
      <div className="relative w-[72px] h-[72px] flex items-center justify-center">
        {/* Track */}
        <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
        {/* Active arc */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        {/* Center badge */}
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
          <WareTrackLogo className="w-6 h-[17px]" />
        </div>
      </div>

      {/* Dots */}
      <div className="flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>

      {message && (
        <p className="text-sm text-foreground/45 font-medium tracking-wide">{message}</p>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-primary/10 ${className}`} />;
}

export function TableSkeleton() {
  return <Spinner message="Chargement des données…" />;
}

export function DashboardSkeleton() {
  return <Spinner message="Chargement du tableau de bord…" />;
}
