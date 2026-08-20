import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function diff(deadline) {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { ms, days, hours, minutes, seconds };
}

export default function CountdownTimer({ to, compact = false, showIcon = true, className = "" }) {
  const [t, setT] = useState(() => diff(to));

  useEffect(() => {
    if (!to) return;
    const id = setInterval(() => setT(diff(to)), 1000);
    return () => clearInterval(id);
  }, [to]);

  if (!to) return null;
  if (!t) return (
    <span className={`text-xs font-medium text-muted-foreground ${className}`}>Bidding closed</span>
  );

  const urgent = t.ms < 60 * 60 * 1000;
  const fmt = (n) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums ${urgent ? "text-destructive" : "text-foreground"} ${className}`}>
        {showIcon && <Clock className="w-3.5 h-3.5" />}
        {t.days > 0 ? `${t.days}d ` : ""}
        {fmt(t.hours)}:{fmt(t.minutes)}:{fmt(t.seconds)}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${urgent ? "text-destructive" : "text-foreground"} ${className}`}>
      {showIcon && <Clock className="w-4 h-4" />}
      <div className="flex items-baseline gap-1.5 tabular-nums font-semibold">
        {t.days > 0 && <><span className="text-lg">{t.days}</span><span className="text-xs">d</span></>}
        <span className="text-lg">{fmt(t.hours)}</span><span className="text-xs">h</span>
        <span className="text-lg">{fmt(t.minutes)}</span><span className="text-xs">m</span>
        <span className="text-lg">{fmt(t.seconds)}</span><span className="text-xs">s</span>
      </div>
    </div>
  );
}
