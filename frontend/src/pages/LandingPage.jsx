import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MandiTicker from "@/components/common/MandiTicker";
import { useT } from "@/lib/i18n";
import { useUIStore } from "@/store/uiStore";
import { ArrowRight, Gavel, ShieldCheck, LineChart, Bot, Cloud, ShoppingBag, Sparkles, Quote, MapPin } from "lucide-react";

const HERO_IMG = "https://images.pexels.com/photos/29912210/pexels-photo-29912210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400";
const FIELD_IMG = "https://images.pexels.com/photos/29039800/pexels-photo-29039800.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400";
const MANDI_IMG = "https://images.pexels.com/photos/15741144/pexels-photo-15741144.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function LandingPage() {
  const t = useT();
  const lang = useUIStore((s) => s.language);
  const isHi = lang === "hi";

  return (
    <div data-testid="landing-page">
      {/* Hero */}
      <section className="relative grain-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 lg:pt-20 pb-16 lg:pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="label-eyebrow text-primary" data-testid="hero-eyebrow">
              ◇ {t("land.eyebrow")}
            </p>
            <h1 className={`mt-4 font-display text-4xl sm:text-5xl lg:text-7xl font-semibold leading-[1.05] tracking-tight ${isHi ? "font-hindi" : ""}`}>
              {t("land.hero_h1_a")}
              <span className="italic text-primary">{t("land.hero_h1_b")}</span>
            </h1>
            <p className={`mt-6 text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed ${isHi ? "font-hindi" : ""}`}>
              {t("land.hero_sub")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7 h-12" data-testid="hero-cta-farmer">
                <Link to="/auth/register?role=FARMER">
                  {t("land.cta_farmer")} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12 border-foreground/15" data-testid="hero-cta-buyer">
                <Link to="/auth/register?role=BUYER">{t("land.cta_buyer")}</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full px-5 h-12 text-muted-foreground" data-testid="hero-cta-explore">
                <Link to="/marketplace">Explore marketplace →</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl">
              {[
                { v: "12,400+", l: "Farmers listed" },
                { v: "₹4.2 Cr", l: "Mandi deals settled" },
                { v: "28", l: "States · 480 mandis" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display stat-num text-2xl lg:text-3xl">{s.v}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-border ring-soft">
              <img src={HERO_IMG} alt="Indian farmer in field" className="w-full h-[460px] object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/65 to-transparent text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-amber-200">
                  <MapPin className="w-3.5 h-3.5" /> Amritsar · Punjab
                </div>
                <p className="font-display text-xl mt-1">Wheat harvest, Rabi 2026</p>
              </div>
            </div>
            <div className="hidden md:block absolute -left-8 -bottom-8 w-44 rotate-[-6deg] bg-card border border-border rounded-2xl p-3 ring-soft">
              <img src={MANDI_IMG} alt="" className="w-full h-24 object-cover rounded-lg" />
              <div className="mt-2 px-1">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Live mandi</div>
                <div className="font-display text-base">Onion · Nashik</div>
                <div className="font-semibold text-primary tabular-nums text-sm">₹1,740 <span className="text-emerald-600 text-xs">+2.6%</span></div>
              </div>
            </div>
          </div>
        </div>

        <MandiTicker />
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="label-eyebrow text-primary">◇ The platform</p>
            <h2 className={`mt-3 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold leading-tight ${isHi ? "font-hindi" : ""}`}>
              {t("land.feature_h")}
            </h2>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Gavel, t: t("land.f1_t"), d: t("land.f1_d"), color: "text-primary", bg: "bg-primary/10" },
              { icon: ShieldCheck, t: t("land.f2_t"), d: t("land.f2_d"), color: "text-secondary", bg: "bg-secondary/10" },
              { icon: LineChart, t: t("land.f3_t"), d: t("land.f3_d"), color: "text-amber-700", bg: "bg-amber-100" },
              { icon: Bot, t: t("land.f4_t"), d: t("land.f4_d"), color: "text-primary", bg: "bg-primary/10" },
              { icon: Cloud, t: t("land.f5_t"), d: t("land.f5_d"), color: "text-sky-700", bg: "bg-sky-100" },
              { icon: ShoppingBag, t: t("land.f6_t"), d: t("land.f6_d"), color: "text-secondary", bg: "bg-secondary/10" },
            ].map((f, i) => (
              <div
                key={i}
                data-testid={`feature-${i}`}
                className="bg-card border border-border rounded-2xl p-6 lift hover:border-foreground/15"
              >
                <div className={`w-11 h-11 rounded-xl grid place-items-center ${f.bg} ${f.color}`}>
                  <f.icon className="w-5 h-5" strokeWidth={1.7} />
                </div>
                <h3 className={`mt-5 font-display text-xl ${isHi ? "font-hindi" : ""}`}>{f.t}</h3>
                <p className={`mt-2 text-sm text-muted-foreground leading-relaxed ${isHi ? "font-hindi" : ""}`}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28 bg-muted/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="label-eyebrow text-primary">◇ For farmers</p>
            <h2 className="mt-3 font-display text-3xl lg:text-5xl font-semibold leading-tight">
              List your harvest. <em className="not-italic text-primary">Get a fair price.</em>
            </h2>
            <ol className="mt-8 space-y-5">
              {[
                "List your crop with base price and minimum bid — admin sets the auction window.",
                "KYC-verified buyers compete openly. Accept the bid you like — or run a direct sale.",
                "Chat directly, settle pickup at your mandi. Your money, your terms.",
              ].map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-display text-base">
                    {i + 1}
                  </span>
                  <p className="text-base leading-relaxed pt-1.5">{s}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-full px-7" data-testid="how-cta">
                <Link to="/auth/register?role=FARMER">List your first crop →</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img src={FIELD_IMG} alt="Farmer in lush rice fields" className="w-full h-[520px] object-cover rounded-3xl border border-border" />
            <div className="absolute -bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-72 bg-card border border-border rounded-2xl p-4 ring-soft">
              <div className="flex items-center gap-2 text-amber-700">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs uppercase tracking-[0.22em] font-semibold">AI tip</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                Light rain expected tomorrow at Amritsar. <span className="font-semibold">Skip irrigation today</span> — save 30 minutes & water.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial-ish */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <Quote className="w-10 h-10 text-primary/60" />
          <p className="mt-4 font-display text-2xl lg:text-4xl leading-snug tracking-tight">
            "Pehle bichauliye 2150 dete the. Krishi Fare par direct buyer ne <span className="text-primary">2480 ka bid</span> diya. Ek hi week mein 30 quintal bik gaya."
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted-foreground">
            — Ramu Kisan, Amritsar · Wheat Farmer
          </p>
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-4 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto rounded-3xl mandi-board p-10 md:p-16 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <p className="label-eyebrow text-amber-300">◇ Ready when you are</p>
            <h3 className="mt-3 font-display text-3xl lg:text-4xl">Bring your harvest to a fair mandi.</h3>
            <p className="mt-2 text-white/70 text-sm max-w-xl">Demo accounts available — try Krishi Fare with farmer, buyer or admin role in seconds.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7 h-12" data-testid="cta-register">
              <Link to="/auth/register">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12 bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white" data-testid="cta-demo">
              <Link to="/auth/login">Try demo accounts</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
