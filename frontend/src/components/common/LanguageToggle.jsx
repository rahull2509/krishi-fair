import { useUIStore } from "@/store/uiStore";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useUIStore();
  return (
    <button
      onClick={toggleLanguage}
      data-testid="language-toggle"
      aria-label="Toggle language"
      className="relative inline-flex items-center w-[78px] h-9 rounded-full border border-border bg-muted overflow-hidden text-xs font-semibold tracking-wide select-none"
    >
      <span
        className={`absolute top-0.5 bottom-0.5 w-9 rounded-full bg-primary transition-all duration-300 ease-out ${
          language === "en" ? "left-0.5" : "left-[39px]"
        }`}
      />
      <span className={`relative z-10 w-[39px] text-center transition-colors ${language === "en" ? "text-primary-foreground" : "text-muted-foreground"}`}>
        EN
      </span>
      <span className={`relative z-10 w-[39px] text-center transition-colors ${language === "hi" ? "text-primary-foreground" : "text-muted-foreground"}`}>
        हिं
      </span>
    </button>
  );
}
