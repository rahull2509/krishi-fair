import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Gavel, ShoppingCart, ShieldCheck, AlertCircle } from "lucide-react";
import CountdownTimer from "@/components/common/CountdownTimer";
import { bidService, cropService } from "@/lib/api/services";
import { useAuthStore } from "@/store/authStore";
import { useT } from "@/lib/i18n";

export default function BidPanel({ crop, onUpdate }) {
  const t = useT();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [amount, setAmount] = useState(crop.minBidPrice || crop.basePrice);
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const isFarmerOwner = user?.id === crop.farmerId;
  const ended = crop.biddingEndsAt && new Date(crop.biddingEndsAt) < new Date();

  const handleBid = async () => {
    if (!token) return navigate("/auth/login");
    if (user?.role !== "BUYER") return toast.error("Only buyers can bid");
    if (user?.kycStatus !== "VERIFIED") {
      toast.warning("Complete KYC to start bidding");
      return navigate("/kyc");
    }
    if (Number(amount) < crop.minBidPrice) {
      return toast.error(`Bid must be at least ₹${crop.minBidPrice}/qtl`);
    }
    setSubmitting(true);
    try {
      await bidService.place(crop.id, { amount: Number(amount), message });
      toast.success("Bid submitted");
      setMessage("");
      onUpdate?.();
    } catch (e) {
      toast.error(e?.message || "Bid failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuy = async () => {
    if (!token) return navigate("/auth/login");
    if (user?.role !== "BUYER") return toast.error("Only buyers can purchase");
    setSubmitting(true);
    try {
      await cropService.directPurchase(crop.id, qty);
      toast.success(`Order placed for ${qty} ${crop.unit}`);
      onUpdate?.();
    } catch (e) {
      toast.error(e?.message || "Purchase failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isFarmerOwner) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-5">
        <p className="text-sm text-muted-foreground">This is your listing — buyers will see the bid panel here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden ring-soft" data-testid="bid-panel">
      <div className="mandi-board px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {crop.allowBidding ? <Gavel className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          <span className="text-xs uppercase tracking-[0.22em] font-semibold">
            {crop.allowBidding ? t("crop.bidding_open") : t("crop.direct_buy")}
          </span>
        </div>
        {crop.allowBidding && crop.biddingEndsAt && (
          <CountdownTimer to={crop.biddingEndsAt} compact />
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label-eyebrow">{t("crop.base_price")}</p>
            <p className="font-display text-2xl tabular-nums">₹{crop.basePrice.toLocaleString("en-IN")}</p>
          </div>
          {crop.allowBidding ? (
            <div>
              <p className="label-eyebrow">{t("crop.min_bid")}</p>
              <p className="font-display text-2xl tabular-nums text-primary">₹{crop.minBidPrice.toLocaleString("en-IN")}</p>
            </div>
          ) : (
            <div>
              <p className="label-eyebrow">{t("crop.qty")}</p>
              <p className="font-display text-2xl tabular-nums">{crop.quantity} {crop.unit}</p>
            </div>
          )}
        </div>

        {user?.role === "BUYER" && user?.kycStatus !== "VERIFIED" && (
          <Alert className="bg-amber-50 border-amber-200" data-testid="kyc-warning">
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            <AlertTitle className="text-amber-900">KYC required</AlertTitle>
            <AlertDescription className="text-amber-800 text-xs">
              {t("bid.kyc_required")}{" "}
              <button onClick={() => navigate("/kyc")} className="underline font-medium">
                Complete now →
              </button>
            </AlertDescription>
          </Alert>
        )}

        {ended && crop.allowBidding && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Bidding closed</AlertTitle>
            <AlertDescription>The bidding window has ended for this crop.</AlertDescription>
          </Alert>
        )}

        {crop.allowBidding ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="bid-amount">{t("bid.your_bid")}</Label>
              <Input
                id="bid-amount"
                data-testid="bid-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={ended}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="bid-msg">{t("bid.message")}</Label>
              <Textarea
                id="bid-msg"
                data-testid="bid-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="e.g. Will pick up 50 quintals tomorrow morning"
                className="mt-1.5"
                disabled={ended}
              />
            </div>
            <Button
              onClick={handleBid}
              disabled={submitting || ended}
              data-testid="submit-bid"
              className="w-full h-11 rounded-md text-base"
            >
              <Gavel className="w-4 h-4 mr-2" />
              {t("bid.submit")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="qty">{t("crop.qty")} ({crop.unit})</Label>
              <Input
                id="qty"
                data-testid="buy-qty"
                type="number"
                min={1}
                max={crop.quantity}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground tabular-nums">₹{((Number(qty) || 0) * crop.basePrice).toLocaleString("en-IN")}</span>
            </p>
            <Button
              onClick={handleBuy}
              disabled={submitting}
              data-testid="buy-now"
              className="w-full h-11 rounded-md text-base bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t("crop.buy_now")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
