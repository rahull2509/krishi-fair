import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useT } from "@/lib/i18n";
import LanguageToggle from "@/components/common/LanguageToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wheat, ShoppingBasket, Sprout, Cloud, Bot, MessageCircle, LayoutDashboard, LogOut, User, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { chatService } from "@/lib/api/services";

const Brand = () => (
  <Link to="/" className="flex items-center gap-2 group" data-testid="nav-brand">
    <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary text-primary-foreground shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)]">
      <Wheat className="w-5 h-5" strokeWidth={1.8} />
    </span>
    <span className="font-display text-xl tracking-tight">
      Krishi <span className="text-primary">Fair</span>
    </span>
  </Link>
);

const NavItem = ({ to, icon: Icon, children, testid }) => (
  <NavLink
    to={to}
    data-testid={testid}
    className={({ isActive }) =>
      `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`
    }
  >
    <Icon className="w-4 h-4" strokeWidth={1.6} />
    {children}
  </NavLink>
);

export default function Navbar() {
  const t = useT();
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const lang = useUIStore((s) => s.language);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      chatService.getUnreadCount().then(res => {
        if (res?.data?.count !== undefined) setUnreadCount(res.data.count);
      }).catch(() => {});
      
      const interval = setInterval(() => {
        chatService.getUnreadCount().then(res => {
          if (res?.data?.count !== undefined) setUnreadCount(res.data.count);
        }).catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [token]);

  const initials = (user?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-8 h-[68px]">
        <div className="flex items-center gap-8">
          <Brand />
          <nav className={`hidden lg:flex items-center gap-1 ${lang === "hi" ? "font-hindi" : ""}`}>
            <NavItem to="/marketplace" icon={ShoppingBasket} testid="nav-marketplace">{t("nav.marketplace")}</NavItem>
            <NavItem to="/mandi-prices" icon={Sprout} testid="nav-mandi-prices">{t("nav.mandi_prices")}</NavItem>
            <NavItem to="/agro-monitoring" icon={Cloud} testid="nav-agro">{t("nav.agro")}</NavItem>
            <NavItem to="/ai-assistant" icon={Bot} testid="nav-ai">{t("nav.ai_assistant")}</NavItem>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {token ? (
            <>
              <NavLink
                to="/chats"
                data-testid="nav-chats"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <div className="relative">
                  <MessageCircle className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {t("nav.chats")}
              </NavLink>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    data-testid="nav-user-menu"
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition"
                  >
                    <span className="grid place-items-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </span>
                    <span className="hidden md:inline text-sm font-medium pr-1">{user?.name?.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} data-testid="menu-dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t("nav.dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile">
                    <User className="w-4 h-4 mr-2" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => { logout(); navigate("/"); }}
                    data-testid="menu-logout"
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/auth/login")}
                data-testid="nav-login"
                className="hidden sm:inline-flex"
              >
                {t("nav.login")}
              </Button>
              <Button
                onClick={() => navigate("/auth/register")}
                data-testid="nav-register"
                className="rounded-full px-5"
              >
                {t("nav.register")}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            data-testid="nav-mobile-toggle"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="px-4 py-3 grid gap-1">
            <NavItem to="/marketplace" icon={ShoppingBasket} testid="m-mkt">{t("nav.marketplace")}</NavItem>
            <NavItem to="/mandi-prices" icon={Sprout} testid="m-mandi">{t("nav.mandi_prices")}</NavItem>
            <NavItem to="/agro-monitoring" icon={Cloud} testid="m-agro">{t("nav.agro")}</NavItem>
            <NavItem to="/ai-assistant" icon={Bot} testid="m-ai">{t("nav.ai_assistant")}</NavItem>
            {token && (
              <NavLink
                to="/chats"
                data-testid="m-chats"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" strokeWidth={1.6} />
                  {t("nav.chats")}
                </div>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
