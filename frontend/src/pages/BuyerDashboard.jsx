import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bidService } from "@/lib/api/services";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import KycStepper from "@/components/common/KycStepper";
import CountdownTimer from "@/components/common/CountdownTimer";
import { ShieldCheck, ShoppingBag, Gavel, IndianRupee, ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";

const Stat = ({ icon: Icon, label, value, tone = "primary" }) => (
  <div className="bg-card border border-border rounded-2xl p-5">
    <div className={`w-10 h-10 rounded-lg grid place-items-center ${tone === "primary" ? "bg-primary/10 text-primary" : tone === "secondary" ? "bg-secondary/10 text-secondary" : "bg-amber-100 text-amber-700"}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="mt-4 label-eyebrow">{label}</p>
    <p className="font-display stat-num text-3xl mt-1">{value}</p>
  </div>
);

export default function BuyerDashboard() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await bidService.myBids();
        setBids(r.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const accepted = bids.filter((b) => b.status === "ACCEPTED");
  const totalValue = accepted.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10" data-testid="buyer-dashboard">
      <p className="label-eyebrow text-primary">◇ Namaste {user?.name?.split(" ")[0]}</p>
      <h1 className="mt-2 font-display text-3xl lg:text-4xl">{t("dash.buyer.title")}</h1>

      {user?.kycStatus !== "VERIFIED" && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-6" data-testid="kyc-banner">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-800">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs uppercase tracking-[0.22em] font-semibold">KYC required</span>
              </div>
              <h3 className="mt-2 font-display text-xl">Verify yourself to start bidding</h3>
              <p className="text-sm text-amber-900/80 mt-1">{t("kyc.intro")}</p>
            </div>
            <Button asChild className="rounded-full" data-testid="goto-kyc">
              <Link to="/kyc">Complete KYC <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
          </div>
          <div className="mt-6">
            <KycStepper status={user?.kycStatus || "NOT_SUBMITTED"} />
          </div>
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Gavel} label="Total bids" value={bids.length} />
        <Stat icon={ShoppingBag} label="Won crops" value={accepted.length} tone="secondary" />
        <Stat icon={IndianRupee} label="Locked value" value={`₹${totalValue.toLocaleString("en-IN")}`} tone="amber" />
        <Stat icon={ShieldCheck} label="KYC" value={user?.kycStatus || "NOT_SUBMITTED"} tone="secondary" />
      </div>

      <h2 className="mt-12 font-display text-2xl">{t("dash.my_bids")}</h2>
      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : bids.length === 0 ? (
          <div className="border border-dashed rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No bids placed yet.</p>
            <Button asChild className="mt-4"><Link to="/marketplace">Browse marketplace</Link></Button>
          </div>
        ) : (
          <div className="space-y-2">
            {bids.map((b) => (
              <Link
                to={b.crop ? `/crops/${b.crop.id}` : "#"}
                key={b.id}
                data-testid={`my-bid-${b.id}`}
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/40"
              >
                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                  {b.crop?.images?.[0] && (
                    <img src={b.crop.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg truncate">{b.crop?.title || "Crop"}</p>
                  {b.message && <p className="text-xs text-muted-foreground truncate">{b.message}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Bid placed {new Date(b.createdAt).toLocaleDateString()}</span>
                    {b.crop?.biddingEndsAt && <CountdownTimer to={b.crop.biddingEndsAt} compact />}
                  </div>
                </div>
                <Badge variant={b.status === "ACCEPTED" ? "default" : b.status === "REJECTED" ? "destructive" : "outline"} className={b.status === "ACCEPTED" ? "bg-secondary text-secondary-foreground" : ""}>{b.status}</Badge>
                <div className="font-display text-xl tabular-nums">₹{b.amount.toLocaleString("en-IN")}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
