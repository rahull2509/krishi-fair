import { Link } from "react-router-dom";
import { Wheat } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid lg:grid-cols-4 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Wheat className="w-5 h-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-xl tracking-tight">
              Krishi <span className="text-primary">Fair</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
            A fair, transparent agricultural marketplace built for Indian farmers and verified buyers.
            Bidding, KYC, AGMARKNET prices, weather and AI advisory — all in one platform.
          </p>
        </div>
        <div>
          <p className="label-eyebrow mb-3">Marketplace</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/marketplace" className="hover:text-primary">{t("nav.marketplace")}</Link></li>
            <li><Link to="/mandi-prices" className="hover:text-primary">{t("nav.mandi_prices")}</Link></li>
            <li><Link to="/agro-monitoring" className="hover:text-primary">{t("nav.agro")}</Link></li>
            <li><Link to="/ai-assistant" className="hover:text-primary">{t("nav.ai_assistant")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="label-eyebrow mb-3">Account</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/auth/login" className="hover:text-primary">{t("nav.login")}</Link></li>
            <li><Link to="/auth/register" className="hover:text-primary">{t("nav.register")}</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary">{t("nav.dashboard")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Krishi Fair. Made with मिट्टी से प्यार.</span>
          <span>AGMARKNET • AgroMonitoring • Krishi AI</span>
        </div>
      </div>
    </footer>
  );
}
