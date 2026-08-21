import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useT } from "@/lib/i18n";
import { useUIStore } from "@/store/uiStore";
import { Wheat, ShoppingBasket, Sprout, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const t = useT();
  const lang = useUIStore((s) => s.language);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, loading } = useAuthStore();

  const [role, setRole] = useState((params.get("role") === "BUYER" ? "BUYER" : "FARMER"));
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await register({ ...form, role });
      toast.success(`Welcome ${user.name}!`);
      navigate(role === "FARMER" ? "/dashboard/farmer" : "/dashboard/buyer");
    } catch (e) {
      toast.error(e?.message || "Register failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] grid lg:grid-cols-[1fr_1.1fr]" data-testid="register-page">
      <div className="flex items-center justify-center p-6 lg:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <p className="label-eyebrow text-primary">◇ {t("auth.create_account")}</p>
          <h1 className={`mt-2 font-display text-3xl lg:text-4xl ${lang === "hi" ? "font-hindi" : ""}`}>
            Join Krishi <span className="text-primary">Fare</span>
          </h1>

          <div className="mt-6">
            <Label className="text-xs uppercase tracking-[0.22em]">{t("auth.role")}</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[
                { v: "FARMER", label: t("auth.farmer"), icon: Sprout, hint: "List crops, accept bids" },
                { v: "BUYER", label: t("auth.buyer"), icon: ShoppingBasket, hint: "KYC, bid & buy" },
              ].map((r) => (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setRole(r.v)}
                  data-testid={`role-${r.v}`}
                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition ${
                    role === r.v
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <span className={`grid place-items-center w-9 h-9 rounded-md ${role === r.v ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"}`}>
                    <r.icon className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-display text-base">{r.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" data-testid="register-form">
            <div>
              <Label htmlFor="r-name">{t("auth.name")}</Label>
              <Input id="r-name" required value={form.name} onChange={set("name")} className="mt-1.5 h-11" data-testid="reg-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="r-email">{t("auth.email")}</Label>
                <Input id="r-email" type="email" required value={form.email} onChange={set("email")} className="mt-1.5 h-11" data-testid="reg-email" />
              </div>
              <div>
                <Label htmlFor="r-phone">{t("auth.phone")}</Label>
                <Input id="r-phone" required value={form.phone} onChange={set("phone")} className="mt-1.5 h-11" data-testid="reg-phone" />
              </div>
            </div>
            <div>
              <Label htmlFor="r-password">{t("auth.password")}</Label>
              <Input id="r-password" type="password" required minLength={6} value={form.password} onChange={set("password")} className="mt-1.5 h-11" data-testid="reg-password" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-md text-base" data-testid="register-submit">
              {loading ? "…" : t("auth.register_btn")} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            {t("auth.have_account")}{" "}
            <Link to="/auth/login" className="text-primary font-semibold hover:underline" data-testid="link-login">
              {t("auth.signin_btn")}
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative order-1 lg:order-2">
        <img
          src="https://images.pexels.com/photos/29912210/pexels-photo-29912210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1100&w=900"
          alt="Indian farmer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tl from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-2 mb-6">
            <span className="grid place-items-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Wheat className="w-5 h-5" />
            </span>
            <span className="font-display text-2xl">Krishi Fair</span>
          </div>
          <p className="text-amber-200 text-xs uppercase tracking-[0.22em]">A new mandi for India</p>
          <h2 className="mt-2 font-display text-4xl xl:text-5xl leading-tight">
            Fairer prices.<br />
            Verified buyers.<br />
            <em className="text-amber-300 not-italic">Real freedom.</em>
          </h2>
        </div>
      </div>
    </div>
  );
}
