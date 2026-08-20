import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useT } from "@/lib/i18n";
import { useUIStore } from "@/store/uiStore";
import { Wheat, ArrowRight, Sparkles } from "lucide-react";

const DEMOS = [
  { role: "ADMIN", email: "admin@krishifare.com", password: "Admin@123", labelKey: "auth.demo_admin" },
  { role: "FARMER", email: "ramu@farmer.com", password: "Farmer@123", labelKey: "auth.demo_farmer" },
  { role: "BUYER", email: "suresh@buyer.com", password: "Buyer@123", labelKey: "auth.demo_buyer" },
];

export default function LoginPage() {
  const t = useT();
  const lang = useUIStore((s) => s.language);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    try {
      const u = await login(email, password);
      toast.success(`Welcome ${u.name}`);
      const target = location.state?.from || (u.role === "ADMIN" ? "/dashboard/admin" : u.role === "FARMER" ? "/dashboard/farmer" : "/dashboard/buyer");
      navigate(target);
    } catch (e) {
      toast.error(e?.message || "Login failed");
    }
  };

  const demoLogin = async (d) => {
    setEmail(d.email);
    setPassword(d.password);
    try {
      const u = await login(d.email, d.password);
      toast.success(`Demo: ${u.name}`);
      navigate(u.role === "ADMIN" ? "/dashboard/admin" : u.role === "FARMER" ? "/dashboard/farmer" : "/dashboard/buyer");
    } catch (e) {
      toast.error(e?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] grid lg:grid-cols-2" data-testid="login-page">
      <div className="hidden lg:block relative">
        <img
          src="https://images.pexels.com/photos/29039800/pexels-photo-29039800.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1100&w=900"
          alt="rice field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/15 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-2 mb-6">
            <span className="grid place-items-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Wheat className="w-5 h-5" />
            </span>
            <span className="font-display text-2xl">Krishi Fare</span>
          </div>
          <p className="text-amber-200 text-xs uppercase tracking-[0.22em]">Welcome back</p>
          <h2 className="mt-2 font-display text-4xl xl:text-5xl leading-tight">
            A fair mandi <em className="text-amber-300 not-italic">never sleeps.</em>
          </h2>
          <p className="mt-3 text-white/75 max-w-md text-sm leading-relaxed">
            Sign in to continue listing crops, placing bids, or moderating verified buyers.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <p className="label-eyebrow text-primary">◇ {t("auth.welcome_back")}</p>
          <h1 className={`mt-2 font-display text-3xl lg:text-4xl ${lang === "hi" ? "font-hindi" : ""}`}>
            {t("auth.signin_btn")}
          </h1>
          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="login-form">
            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-11"
                data-testid="login-email"
                placeholder="ramu@farmer.com"
              />
            </div>
            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11"
                data-testid="login-password"
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-md text-base" disabled={loading} data-testid="login-submit">
              {loading ? "…" : t("auth.signin_btn")} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              <span className="uppercase tracking-[0.22em]">{t("auth.demo_title")}</span>
              <span className="flex-1 h-px bg-border" />
            </div>
            <div className="mt-4 grid gap-2">
              {DEMOS.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => demoLogin(d)}
                  data-testid={`demo-${d.role.toLowerCase()}`}
                  className="group flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-9 h-9 rounded-md bg-muted text-foreground/70 group-hover:bg-primary/10 group-hover:text-primary transition">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{t(d.labelKey)}</div>
                      <div className="text-xs text-muted-foreground">{d.email}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground text-center">
            {t("auth.no_account")}{" "}
            <Link to="/auth/register" className="text-primary font-semibold hover:underline" data-testid="link-register">
              {t("auth.register_btn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
