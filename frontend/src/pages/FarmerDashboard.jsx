import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cropService, bidService } from "@/lib/api/services";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CountdownTimer from "@/components/common/CountdownTimer";
import { toast } from "sonner";
import { Plus, Wheat, Gavel, IndianRupee, Package, CheckCircle2, XCircle, ImageOff } from "lucide-react";
import { useT } from "@/lib/i18n";

const Stat = ({ icon: Icon, label, value, tone = "primary", testid }) => (
  <div className="bg-card border border-border rounded-2xl p-5 ring-soft" data-testid={testid}>
    <div className={`w-10 h-10 rounded-lg grid place-items-center ${tone === "primary" ? "bg-primary/10 text-primary" : tone === "secondary" ? "bg-secondary/10 text-secondary" : "bg-amber-100 text-amber-700"}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="mt-4 label-eyebrow">{label}</p>
    <p className="font-display stat-num text-3xl mt-1">{value}</p>
  </div>
);

export default function FarmerDashboard() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await cropService.myCrops();
      setCrops(res.data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const stats = {
    listings: crops.filter((c) => c.status === "OPEN").length,
    sold: crops.filter((c) => c.status === "SOLD").length,
    totalBids: crops.reduce((a, c) => a + (c.bidsCount || 0), 0),
    earnings: crops.filter((c) => c.status === "SOLD").reduce((a, c) => a + (c.basePrice * c.quantity), 0),
  };

  const allBids = crops.flatMap((c) =>
    (c.bids || []).map((b) => ({ ...b, crop: c }))
  );

  // we need bids per crop. fetch separately
  const [bidsByCrop, setBidsByCrop] = useState({});
  useEffect(() => {
    (async () => {
      const map = {};
      for (const c of crops) {
        try {
          const r = await bidService.listForCrop(c.id);
          map[c.id] = r.data || [];
        } catch {}
      }
      setBidsByCrop(map);
    })();
  }, [crops]);

  const handleBid = async (bidId, action) => {
    try {
      await bidService.setStatus(bidId, action);
      toast.success(`Bid ${action.toLowerCase()}`);
      load();
    } catch (e) {
      toast.error(e?.message || "Failed");
    }
  };
  const removeCrop = async (id) => {
    try {
      await cropService.remove(id);
      toast.success("Listing removed");
      load();
    } catch (e) { toast.error(e?.message || "Failed"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10" data-testid="farmer-dashboard">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="label-eyebrow text-primary">◇ Namaste {user?.name?.split(" ")[0]}</p>
          <h1 className="mt-2 font-display text-3xl lg:text-4xl tracking-tight">{t("dash.farmer.title")}</h1>
        </div>
        <Button asChild className="rounded-full px-6" data-testid="add-crop-btn">
          <Link to="/dashboard/farmer/new"><Plus className="w-4 h-4 mr-1.5" /> {t("dash.add_crop")}</Link>
        </Button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Wheat} label={t("dash.listings")} value={stats.listings} tone="primary" testid="stat-listings" />
        <Stat icon={Gavel} label={t("dash.active_bids")} value={Object.values(bidsByCrop).flat().filter((b) => b.status === "PENDING").length} tone="amber" testid="stat-bids" />
        <Stat icon={Package} label={t("dash.sold")} value={stats.sold} tone="secondary" testid="stat-sold" />
        <Stat icon={IndianRupee} label={t("dash.earnings")} value={`₹${stats.earnings.toLocaleString("en-IN")}`} tone="primary" testid="stat-earnings" />
      </div>

      <Tabs defaultValue="crops" className="mt-10">
        <TabsList className="bg-muted">
          <TabsTrigger value="crops" data-testid="tab-my-crops">{t("dash.my_crops")}</TabsTrigger>
          <TabsTrigger value="bids" data-testid="tab-incoming-bids">Incoming bids</TabsTrigger>
        </TabsList>

        <TabsContent value="crops" className="mt-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : crops.length === 0 ? (
            <div className="border border-dashed rounded-xl p-12 text-center">
              <ImageOff className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">No listings yet. List your first crop to start receiving bids.</p>
              <Button asChild className="mt-4"><Link to="/dashboard/farmer/new">Create listing</Link></Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {crops.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden lift">
                  <Link to={`/crops/${c.id}`} className="block aspect-[16/10] bg-muted">
                    <img src={c.images?.[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  </Link>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs">{c.category}</Badge>
                      <Badge variant={c.status === "SOLD" ? "destructive" : "default"} className={c.status !== "SOLD" ? "bg-secondary text-secondary-foreground" : ""}>{c.status}</Badge>
                    </div>
                    <h4 className="mt-2 font-display text-lg leading-tight line-clamp-1">{c.title}</h4>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">₹{c.basePrice.toLocaleString("en-IN")} · {c.quantity}{c.unit?.[0]}</span>
                      {c.allowBidding && c.biddingEndsAt && c.status === "OPEN" && (
                        <CountdownTimer to={c.biddingEndsAt} compact />
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{c.bidsCount || 0} bids · highest ₹{(c.highestBid || 0).toLocaleString("en-IN")}</span>
                      <div className="flex gap-1">
                        <Button asChild size="sm" variant="ghost"><Link to={`/crops/${c.id}`}>View</Link></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeCrop(c.id)} data-testid={`remove-${c.id}`}>Delete</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bids" className="mt-6">
          <div className="space-y-2">
            {Object.entries(bidsByCrop).map(([cropId, list]) => {
              const crop = crops.find((c) => c.id === cropId);
              if (!list?.length || !crop) return null;
              return (
                <div key={cropId} className="bg-card border border-border rounded-xl p-4">
                  <Link to={`/crops/${cropId}`} className="font-display text-lg hover:text-primary">{crop.title}</Link>
                  <div className="mt-3 space-y-2">
                    {list.map((b) => (
                      <div key={b.id} className="flex items-center gap-3 bg-muted/40 rounded-lg p-3">
                        <div className="flex-1">
                          <p className="font-medium">{b.buyer?.name}</p>
                          {b.message && <p className="text-xs text-muted-foreground">{b.message}</p>}
                        </div>
                        <Badge variant={b.status === "ACCEPTED" ? "default" : b.status === "REJECTED" ? "destructive" : "outline"} className={b.status === "ACCEPTED" ? "bg-secondary text-secondary-foreground" : ""}>{b.status}</Badge>
                        <div className="font-display text-lg tabular-nums">₹{b.amount.toLocaleString("en-IN")}</div>
                        {b.status === "PENDING" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleBid(b.id, "ACCEPTED")} className="text-secondary hover:bg-secondary/10"><CheckCircle2 className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleBid(b.id, "REJECTED")} className="text-destructive hover:bg-destructive/10"><XCircle className="w-4 h-4" /></Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {Object.values(bidsByCrop).flat().length === 0 && (
              <div className="border border-dashed rounded-xl p-12 text-center">
                <p className="text-muted-foreground">No bids yet. List crops with bidding enabled to receive offers.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
