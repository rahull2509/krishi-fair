import { Link } from "react-router-dom";
import CountdownTimer from "@/components/common/CountdownTimer";
import { Badge } from "@/components/ui/badge";
import { MapPin, Wheat, Gavel, ShoppingBag } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function CropCard({ crop }) {
  const t = useT();
  const img = crop.images?.[0] || "https://images.pexels.com/photos/15741144/pexels-photo-15741144.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
  const ended = crop.allowBidding && crop.biddingEndsAt && new Date(crop.biddingEndsAt) < new Date();

  return (
    <Link
      to={`/crops/${crop.id}`}
      data-testid={`crop-card-${crop.id}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden lift hover:border-primary/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={img}
          alt={crop.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(e) => { e.target.src = "https://images.pexels.com/photos/15741144/pexels-photo-15741144.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"; }}
        />
        <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between">
          {crop.allowBidding ? (
            <Badge className="bg-primary text-primary-foreground hover:bg-primary border-0 gap-1 text-[11px] tracking-wide">
              <Gavel className="w-3 h-3" /> {t("crop.bidding_open")}
            </Badge>
          ) : (
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary border-0 gap-1 text-[11px] tracking-wide">
              <ShoppingBag className="w-3 h-3" /> {t("crop.direct_buy")}
            </Badge>
          )}
          {crop.allowBidding && crop.biddingEndsAt && (
            <span className="bg-black/55 text-white text-[11px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
              {ended ? "Closed" : <CountdownTimer to={crop.biddingEndsAt} compact showIcon={false} />}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/55 to-transparent text-white">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
            <MapPin className="w-3 h-3" />
            {crop.location || `${crop.district}, ${crop.state}`}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
          <Wheat className="w-3 h-3" />
          {crop.category}{crop.variety ? ` • ${crop.variety}` : ""}
        </div>
        <h3 className="mt-1 font-display text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {crop.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          By {crop.farmer?.name || "Farmer"} · {crop.quantity} {crop.unit}
        </p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t("crop.base_price")}</p>
            <p className="font-display text-2xl text-foreground tabular-nums">
              ₹{crop.basePrice.toLocaleString("en-IN")}
              <span className="text-xs text-muted-foreground font-body ml-1">/qtl</span>
            </p>
          </div>
          {crop.allowBidding && crop.highestBid > 0 && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t("crop.current_bid")}</p>
              <p className="font-display text-lg text-primary tabular-nums">₹{crop.highestBid.toLocaleString("en-IN")}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
