import Marquee from "react-fast-marquee";
import { TrendingUp, TrendingDown } from "lucide-react";

const TICKER_DATA = [
  { commodity: "Wheat", market: "Amritsar", price: 2520, delta: 1.4 },
  { commodity: "Rice (Basmati)", market: "Karnal", price: 3475, delta: -0.8 },
  { commodity: "Onion", market: "Nashik", price: 1740, delta: 2.6 },
  { commodity: "Potato", market: "Lucknow", price: 1350, delta: 0.5 },
  { commodity: "Mustard", market: "Karnal", price: 5125, delta: -1.2 },
  { commodity: "Chana", market: "Indore", price: 6080, delta: 0.9 },
  { commodity: "Soybean", market: "Indore", price: 4625, delta: 1.1 },
  { commodity: "Cotton", market: "Rajkot", price: 7100, delta: -0.4 },
  { commodity: "Tomato", market: "Lasalgaon", price: 1320, delta: 3.2 },
  { commodity: "Cumin", market: "Jodhpur", price: 26200, delta: -0.6 },
  { commodity: "Turmeric", market: "Erode", price: 14150, delta: 0.7 },
  { commodity: "Maize", market: "Patna", price: 2050, delta: 0.2 },
];

const Item = ({ d }) => (
  <div className="flex items-center gap-3 px-6 border-r border-white/10">
    <span className="font-display text-base text-amber-200/90">{d.commodity}</span>
    <span className="text-xs text-white/55 uppercase tracking-wider">{d.market}</span>
    <span className="font-semibold text-white tabular-nums">₹{d.price.toLocaleString("en-IN")}</span>
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${d.delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
      {d.delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {d.delta >= 0 ? "+" : ""}{d.delta}%
    </span>
  </div>
);

export default function MandiTicker() {
  return (
    <div className="ticker-glow text-white border-y border-white/10" data-testid="mandi-ticker">
      <div className="max-w-[100vw] flex items-center">
        <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border-r border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-200">
            Live Mandi
          </span>
        </div>
        <div className="flex-1 fade-edge-x">
          <Marquee gradient={false} speed={48} pauseOnHover>
            {TICKER_DATA.map((d, i) => <Item key={i} d={d} />)}
            {TICKER_DATA.map((d, i) => <Item key={`b${i}`} d={d} />)}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
