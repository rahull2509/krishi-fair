import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import CropCard from "@/components/crops/CropCard";
import { cropService } from "@/lib/api/services";
import { useT } from "@/lib/i18n";
import { Search, X, Filter } from "lucide-react";

const CATEGORIES = ["Grain", "Pulse", "Vegetable", "Fruit", "Oilseed", "Spice"];
const STATES = ["Punjab", "Haryana", "Maharashtra", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "Madhya Pradesh", "Bihar", "West Bengal", "Andhra Pradesh"];

export default function MarketplacePage() {
  const t = useT();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    state: "",
    minPrice: "",
    maxPrice: "",
    biddingOnly: false,
  });

  const fetch = async () => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach((k) => params[k] === "" && delete params[k]);
    try {
      const res = await cropService.list(params);
      setCrops(res.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []); // initial
  useEffect(() => {
    const id = setTimeout(fetch, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const clear = () =>
    setFilters({ q: "", category: "", state: "", minPrice: "", maxPrice: "", biddingOnly: false });

  return (
    <div data-testid="marketplace-page">
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <p className="label-eyebrow text-primary">◇ Open marketplace</p>
          <h1 className="mt-2 font-display text-4xl lg:text-5xl tracking-tight">{t("mkt.title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">{t("mkt.subtitle")}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="lg:sticky lg:top-[88px] lg:self-start space-y-5 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
              <button onClick={clear} className="text-xs text-muted-foreground hover:text-primary" data-testid="filter-clear">Clear</button>
            </div>

            <div>
              <Label htmlFor="q">{t("mkt.filter.search")}</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="q" value={filters.q} onChange={(e) => set("q", e.target.value)} className="pl-9" data-testid="filter-q" />
                {filters.q && (
                  <button onClick={() => set("q", "")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <Label>{t("mkt.filter.category")}</Label>
              <Select value={filters.category || "all"} onValueChange={(v) => set("category", v === "all" ? "" : v)}>
                <SelectTrigger className="mt-1.5" data-testid="filter-category"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("mkt.filter.state")}</Label>
              <Select value={filters.state || "all"} onValueChange={(v) => set("state", v === "all" ? "" : v)}>
                <SelectTrigger className="mt-1.5" data-testid="filter-state"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t("mkt.filter.min_price")}</Label>
                <Input type="number" value={filters.minPrice} onChange={(e) => set("minPrice", e.target.value)} className="mt-1.5" data-testid="filter-min" />
              </div>
              <div>
                <Label>{t("mkt.filter.max_price")}</Label>
                <Input type="number" value={filters.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} className="mt-1.5" data-testid="filter-max" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
              <Label htmlFor="bid-only" className="cursor-pointer">{t("mkt.filter.bidding_only")}</Label>
              <Switch id="bid-only" checked={filters.biddingOnly} onCheckedChange={(v) => set("biddingOnly", v)} data-testid="filter-bidding" />
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading…" : `${crops.length} listings`}
              </p>
            </div>
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[420px] rounded-xl" />
                ))}
              </div>
            ) : crops.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-16 text-center">
                <p className="text-muted-foreground">{t("mkt.no_results")}</p>
                <Button onClick={clear} variant="outline" className="mt-4">Clear filters</Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {crops.map((c) => <CropCard key={c.id} crop={c} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
