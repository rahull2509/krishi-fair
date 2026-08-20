import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import { marketService } from "@/lib/api/services";
import { useT } from "@/lib/i18n";
import { Search, ArrowUpRight, ArrowDownRight, Sprout } from "lucide-react";

const COMMODITIES = ["Wheat","Rice","Onion","Potato","Tomato","Mustard","Cotton","Soybean","Maize","Chana","Cumin","Turmeric","Chilli"];
const STATES = ["Punjab","Haryana","Maharashtra","Uttar Pradesh","Karnataka","Tamil Nadu","Gujarat","Rajasthan","Madhya Pradesh","Bihar","West Bengal","Andhra Pradesh"];

export default function MandiPricesPage() {
  const t = useT();
  const [filters, setFilters] = useState({ commodity: "", state: "", q: "" });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await marketService.getPrices({
        commodity: filters.commodity,
        state: filters.state,
        q: filters.q,
        sort: "latest",
        limit: 200,
      });
      setRecords(r.data.records || []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const id = setTimeout(load, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [filters.commodity, filters.state, filters.q]);

  useEffect(() => {
    (async () => {
      const r = await marketService.trends({
        commodity: filters.commodity || "Wheat",
        state: filters.state || "Punjab",
      });
      setTrend(r.data);
    })();
  }, [filters.commodity, filters.state]);

  return (
    <div data-testid="mandi-page">
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-primary">
            <Sprout className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.22em] font-semibold">AGMARKNET · data.gov.in</span>
          </div>
          <h1 className="mt-2 font-display text-4xl lg:text-5xl">{t("mandi.title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">{t("mandi.subtitle")}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          <aside className="space-y-4 bg-card border border-border rounded-2xl p-5 lg:sticky lg:top-[88px] lg:self-start">
            <div>
              <Label>{t("mandi.commodity")}</Label>
              <Select value={filters.commodity || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, commodity: v === "all" ? "" : v }))}>
                <SelectTrigger className="mt-1.5" data-testid="mandi-commodity"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {COMMODITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("mandi.state")}</Label>
              <Select value={filters.state || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, state: v === "all" ? "" : v }))}>
                <SelectTrigger className="mt-1.5" data-testid="mandi-state"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search commodity / mandi / district</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} className="pl-9" data-testid="mandi-search" />
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setFilters({ commodity: "", state: "", q: "" })}>Reset</Button>
          </aside>

          <div className="space-y-6">
            {/* Trend chart */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-eyebrow">14-day trend</p>
                  <p className="font-display text-xl">{trend?.commodity} · {trend?.state}</p>
                </div>
                {trend?.points?.length > 1 && (() => {
                  const first = trend.points[0].modal_price;
                  const last = trend.points.at(-1).modal_price;
                  const delta = (((last - first) / first) * 100).toFixed(1);
                  const up = last >= first;
                  return (
                    <Badge className={`${up ? "bg-secondary text-secondary-foreground" : "bg-destructive text-destructive-foreground"} gap-1`}>
                      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{delta}%
                    </Badge>
                  );
                })()}
              </div>
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend?.points || []}>
                    <defs>
                      <linearGradient id="mandiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(24 92% 41%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(24 92% 41%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#566573" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#566573" }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="modal_price" stroke="hsl(24 92% 41%)" strokeWidth={2} fill="url(#mandiGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Records table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <th className="px-4 py-3">{t("mandi.commodity")}</th>
                      <th className="px-4 py-3">{t("mandi.variety")}</th>
                      <th className="px-4 py-3">{t("mandi.market")}</th>
                      <th className="px-4 py-3">{t("mandi.state")}</th>
                      <th className="px-4 py-3 text-right">{t("mandi.min")}</th>
                      <th className="px-4 py-3 text-right">{t("mandi.modal")}</th>
                      <th className="px-4 py-3 text-right">{t("mandi.max")}</th>
                      <th className="px-4 py-3">{t("mandi.date")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={8} className="p-3"><Skeleton className="h-6 w-full" /></td>
                        </tr>
                      ))
                    ) : records.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No records found.</td></tr>
                    ) : records.map((r, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition" data-testid={`mandi-row-${i}`}>
                        <td className="px-4 py-3 font-display">{r.commodity}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.variety}</td>
                        <td className="px-4 py-3">{r.market}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.state}</td>
                        <td className="px-4 py-3 text-right tabular-nums">₹{r.min_price.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-primary">₹{r.modal_price.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right tabular-nums">₹{r.max_price.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.arrival_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
