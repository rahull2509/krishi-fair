import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { cropService, chatService, bidService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import BidPanel from "@/components/crops/BidPanel";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ArrowLeft, MapPin, MessageCircle, User, Wheat, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function CropDetailPage() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await cropService.getById(id);
      setCrop(res.data);
    } catch (e) {
      toast.error(e?.message || "Could not load crop");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const startChat = async () => {
    if (!token) return navigate("/auth/login");
    try {
      const res = await chatService.getOrCreate(crop.farmer.id);
      navigate(`/chats/${res.data.id}`);
    } catch (e) {
      toast.error(e?.message || "Chat error");
    }
  };

  const handleAccept = async (bidId) => {
    try {
      await bidService.setStatus(bidId, "ACCEPTED");
      toast.success("Bid accepted — crop marked sold");
      load();
    } catch (e) {
      toast.error(e?.message || "Failed");
    }
  };
  const handleReject = async (bidId) => {
    try {
      await bidService.setStatus(bidId, "REJECTED");
      toast.success("Bid rejected");
      load();
    } catch (e) {
      toast.error(e?.message || "Failed");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <Skeleton className="h-[460px] rounded-2xl" />
        <Skeleton className="h-[460px] rounded-2xl" />
      </div>
    );
  }
  if (!crop) return null;

  const isOwner = user?.id === crop.farmerId;

  return (
    <div data-testid="crop-detail-page" className="bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" data-testid="crop-back">
          <ArrowLeft className="w-4 h-4" /> {t("generic.back")}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <div>
          <Carousel className="rounded-2xl overflow-hidden border border-border">
            <CarouselContent>
              {(crop.images?.length ? crop.images : ["https://images.pexels.com/photos/15741144/pexels-photo-15741144.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"]).map((src, i) => (
                <CarouselItem key={i}>
                  <div className="aspect-[16/10] bg-muted">
                    <img src={src} alt={`${crop.title} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {crop.images?.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>

          <div className="mt-6 flex items-center gap-2">
            {crop.allowBidding ? (
              <Badge className="bg-primary text-primary-foreground">{t("crop.bidding_open")}</Badge>
            ) : (
              <Badge className="bg-secondary text-secondary-foreground">{t("crop.direct_buy")}</Badge>
            )}
            <Badge variant="outline">{crop.category}{crop.variety ? ` · ${crop.variety}` : ""}</Badge>
            {crop.status === "SOLD" && <Badge variant="destructive">SOLD</Badge>}
          </div>

          <h1 className="mt-3 font-display text-3xl lg:text-5xl tracking-tight leading-tight">{crop.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{crop.location || `${crop.district}, ${crop.state}`}</span>
            <span className="inline-flex items-center gap-1.5"><Wheat className="w-4 h-4" />{crop.quantity} {crop.unit}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" />Listed {new Date(crop.createdAt).toLocaleDateString()}</span>
          </div>

          <p className="mt-6 text-base leading-relaxed text-foreground/80 max-w-2xl">
            {crop.description}
          </p>

          {/* farmer card */}
          <div className="mt-8 bg-muted/40 border border-border rounded-2xl p-5 flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {crop.farmer?.name?.[0] || "F"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Farmer</p>
              <p className="font-display text-lg">{crop.farmer?.name}</p>
              <p className="text-xs text-muted-foreground">{crop.farmer?.district}, {crop.farmer?.state}</p>
            </div>
            {!isOwner && (
              <Button variant="outline" onClick={startChat} data-testid="chat-farmer-btn">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("crop.chat_farmer")}
              </Button>
            )}
          </div>

          {/* bid history */}
          <div className="mt-8">
            <h3 className="font-display text-xl mb-3">{t("bid.history")}</h3>
            {(!crop.bids || crop.bids.length === 0) ? (
              <p className="text-sm text-muted-foreground">No bids yet.</p>
            ) : (
              <div className="space-y-2">
                {crop.bids.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-3" data-testid={`bid-row-${b.id}`}>
                    <div className="grid place-items-center w-9 h-9 rounded-full bg-muted">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{b.buyer?.name}</p>
                        <Badge variant={b.status === "ACCEPTED" ? "default" : b.status === "REJECTED" ? "destructive" : "outline"} className={b.status === "ACCEPTED" ? "bg-secondary text-secondary-foreground" : ""}>
                          {b.status}
                        </Badge>
                      </div>
                      {b.message && <p className="text-xs text-muted-foreground truncate">{b.message}</p>}
                    </div>
                    <div className="font-display text-lg tabular-nums">₹{b.amount.toLocaleString("en-IN")}</div>
                    {isOwner && b.status === "PENDING" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleAccept(b.id)} className="text-secondary hover:text-secondary hover:bg-secondary/10" data-testid={`accept-bid-${b.id}`}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleReject(b.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`reject-bid-${b.id}`}>
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="lg:sticky lg:top-[88px]">
            <BidPanel crop={crop} onUpdate={load} />
            <div className="mt-4 text-xs text-muted-foreground text-center">
              <Link to="/marketplace" className="hover:text-primary">← Back to marketplace</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
