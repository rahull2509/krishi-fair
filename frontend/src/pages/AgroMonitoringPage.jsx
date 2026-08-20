import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { agroService } from "@/lib/api/services";
import { Cloud, CloudRain, CloudSun, Sun, CloudLightning, Haze, Droplets, Wind, Sprout, Thermometer, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n";

const ICON_MAP = {
  sun: Sun, "cloud-sun": CloudSun, "cloud-rain": CloudRain, "cloud-lightning": CloudLightning, haze: Haze,
};
const PRESETS = [
  { name: "Amritsar", lat: 31.6340, lon: 74.8723 },
  { name: "Karnal", lat: 29.6857, lon: 76.9905 },
  { name: "Nashik", lat: 19.9975, lon: 73.7898 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 },
];
const CROPS = ["Wheat", "Rice", "Onion", "Potato", "Tomato", "Cotton", "Mustard"];

export default function AgroMonitoringPage() {
  const t = useT();
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.2090 });
  const [crop, setCrop] = useState("Wheat");
  const [data, setData] = useState({ now: null, fc: null, irr: null, soil: null });
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [now, fc, irr, soil] = await Promise.all([
        agroService.currentWeather(coords),
        agroService.forecast(coords),
        agroService.irrigationAdvice({ ...coords, cropType: crop }),
        agroService.soil(coords),
      ]);
      setData({ now: now.data, fc: fc.data, irr: irr.data, soil: soil.data });
    } finally { setLoading(false); }
  };

  const applyPreset = (p) => setCoords({ lat: p.lat, lon: p.lon });

  const NowIcon = data.now ? ICON_MAP[data.now.icon] || Cloud : Cloud;

  return (
    <div data-testid="agro-page">
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <p className="label-eyebrow text-primary">◇ AgroMonitoring</p>
          <h1 className="mt-2 font-display text-4xl lg:text-5xl">{t("agro.title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">{t("agro.subtitle")}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="bg-card border border-border rounded-2xl p-5 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
          <div>
            <Label>{t("agro.lat")}</Label>
            <Input type="number" step="0.0001" value={coords.lat} onChange={(e) => setCoords((c) => ({ ...c, lat: Number(e.target.value) }))} className="mt-1.5 h-11" data-testid="agro-lat" />
          </div>
          <div>
            <Label>{t("agro.lon")}</Label>
            <Input type="number" step="0.0001" value={coords.lon} onChange={(e) => setCoords((c) => ({ ...c, lon: Number(e.target.value) }))} className="mt-1.5 h-11" data-testid="agro-lon" />
          </div>
          <div>
            <Label>Crop</Label>
            <Select value={crop} onValueChange={setCrop}>
              <SelectTrigger className="mt-1.5 h-11" data-testid="agro-crop"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchAll} disabled={loading} className="h-11" data-testid="agro-fetch">
            {loading ? "Loading…" : t("agro.fetch")}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:text-primary"
              data-testid={`preset-${p.name}`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8 grid lg:grid-cols-3 gap-5">
          {/* Now */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-1 ring-soft">
            <p className="label-eyebrow text-primary">◇ {t("agro.current")}</p>
            {!data.now ? (
              <Skeleton className="mt-4 h-32 w-full" />
            ) : (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <NowIcon className="w-14 h-14 text-amber-600" />
                  <div>
                    <div className="font-display text-5xl tabular-nums">{Math.round(data.now.temp)}°</div>
                    <div className="text-sm text-muted-foreground">{data.now.condition}</div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground inline-flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> Feels</div>
                    <div className="font-display text-lg">{Math.round(data.now.feels_like)}°</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground inline-flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> Humid.</div>
                    <div className="font-display text-lg">{data.now.humidity}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground inline-flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> Wind</div>
                    <div className="font-display text-lg">{data.now.wind} km/h</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Soil */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-1">
            <p className="label-eyebrow text-secondary">◇ {t("agro.soil")}</p>
            {!data.soil ? (
              <Skeleton className="mt-4 h-32 w-full" />
            ) : (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <Sprout className="w-10 h-10 text-secondary" />
                  <div>
                    <div className="font-display text-3xl tabular-nums">{(data.soil.moisture * 100).toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Moisture (volumetric)</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Surface temp</div>
                    <div className="font-display text-lg">{data.soil.temperature}°C</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">10cm depth</div>
                    <div className="font-display text-lg">{data.soil.t10}°C</div>
                  </div>
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Polygon: {data.soil.polyId}</div>
              </>
            )}
          </div>

          {/* Irrigation advice */}
          <div className="bg-primary/[0.05] border border-primary/20 rounded-2xl p-6 lg:col-span-1">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.22em] font-semibold">{t("agro.irrigation")}</span>
            </div>
            {!data.irr ? (
              <Skeleton className="mt-4 h-32 w-full" />
            ) : (
              <>
                <h3 className="mt-3 font-display text-2xl">
                  {data.irr.recommendedToday ? "Irrigate today" : "Skip irrigation today"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{data.irr.rationale}</p>
                {data.irr.minutes > 0 && (
                  <p className="mt-3 text-sm">Recommended duration: <span className="font-semibold">{data.irr.minutes} min</span></p>
                )}
              </>
            )}
          </div>

          {/* Forecast */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-3">
            <p className="label-eyebrow">◇ {t("agro.forecast")}</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {(data.fc?.points || Array.from({ length: 7 })).map((p, i) => {
                if (!p) return <Skeleton key={i} className="h-32 rounded-xl" />;
                const Icon = ICON_MAP[p.icon] || Cloud;
                return (
                  <div key={i} className="bg-muted/40 border border-border rounded-xl p-3 text-center" data-testid={`forecast-${i}`}>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{p.day}</div>
                    <Icon className="w-7 h-7 mx-auto mt-2 text-amber-600" />
                    <div className="mt-1 font-display tabular-nums text-lg">{Math.round(p.tempMax)}°<span className="text-muted-foreground text-sm"> / {Math.round(p.tempMin)}°</span></div>
                    {p.rainMm > 0 && <div className="text-xs text-sky-700 mt-1">{p.rainMm} mm</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
