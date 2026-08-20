import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";
import { Bot, X, Send, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { aiService } from "@/lib/api/services";
import { useUIStore } from "@/store/uiStore";
import { useT } from "@/lib/i18n";

const HIDDEN_ROUTES = ["/auth/login", "/auth/register"];
const QUICK_PROMPTS = [
  { en: "Why are leaves yellow?", hi: "पत्तियाँ पीली क्यों हैं?" },
  { en: "Irrigation advice", hi: "सिंचाई सलाह" },
  { en: "Market price guidance", hi: "मंडी भाव सलाह" },
];

export default function AIAssistantWidget() {
  const t = useT();
  const location = useLocation();
  const lang = useUIStore((s) => s.language);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        lang === "hi"
          ? "नमस्ते! मैं कृषि AI हूँ। फसल, सिंचाई, मौसम के बारे में पूछें या पत्ती की फ़ोटो भेजें।"
          : "Namaste! I am Krishi AI. Ask about crops, irrigation, weather — or attach a leaf photo for diagnosis.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [aiLang, setAiLang] = useState(lang === "hi" ? "Hindi" : "English");
  const fileRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (HIDDEN_ROUTES.some((p) => location.pathname.startsWith(p))) {
      setOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, open]);

  if (HIDDEN_ROUTES.some((p) => location.pathname.startsWith(p))) return null;

  const handlePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result);
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text && !imageDataUrl) return;
    const userMsg = { role: "user", content: text || "(image attached)", image: imageDataUrl };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    const img = imageDataUrl;
    setImageDataUrl(null);
    setBusy(true);
    try {
      const res = await aiService.chat({
        message: userMsg.content,
        language: aiLang,
        imageDataUrl: img,
      });
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: e?.message || "Error" }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          data-testid="ai-widget-open"
          aria-label="Open Krishi AI"
          className="fixed bottom-24 right-6 z-40 group"
        >
          <span className="absolute inset-0 rounded-full bg-primary/30 pulse-ring" />
          <span className="relative w-14 h-14 grid place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition-transform group-hover:scale-105">
            <Bot className="w-6 h-6" strokeWidth={1.8} />
            <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-300" />
          </span>
        </button>
      )}

      {open && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 sm:w-[380px] h-[560px] max-h-[88vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" data-testid="ai-widget-panel">
          <div className="px-4 py-3 mandi-board flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                <Bot className="w-4 h-4" />
              </span>
              <div>
                <p className="font-display text-base leading-tight">Krishi AI</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">Always-on advisor</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              data-testid="ai-widget-close"
              className="p-1.5 rounded-md hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.image && (
                    <img src={m.image} alt="upload" className="mb-2 rounded-lg max-h-32" />
                  )}
                  <div className={`[&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold ${lang === "hi" ? "font-hindi" : ""}`}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-3.5 py-2.5 text-sm text-muted-foreground">
                  {t("ai.thinking")}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 space-y-2">
            {imageDataUrl && (
              <div className="flex items-center gap-2 bg-muted rounded-md px-2 py-1.5">
                <img src={imageDataUrl} alt="preview" className="w-10 h-10 rounded object-cover" />
                <span className="text-xs flex-1 truncate">Attached image</span>
                <button onClick={() => setImageDataUrl(null)} className="text-xs text-destructive">remove</button>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt, index) => {
                const text = aiLang === "Hindi" ? prompt.hi : prompt.en;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => send(text)}
                    disabled={busy}
                    className="text-[11px] px-2 py-1 rounded-full border border-border bg-muted hover:border-primary/40"
                  >
                    {text}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <Select value={aiLang} onValueChange={setAiLang}>
                <SelectTrigger className="w-[110px] h-9 text-xs" data-testid="ai-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">हिन्दी</SelectItem>
                  <SelectItem value="Marathi">मराठी</SelectItem>
                  <SelectItem value="Punjabi">ਪੰਜਾਬੀ</SelectItem>
                  <SelectItem value="Tamil">தமிழ்</SelectItem>
                  <SelectItem value="Telugu">తెలుగు</SelectItem>
                </SelectContent>
              </Select>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePick} data-testid="ai-file-input" />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => fileRef.current?.click()}
                data-testid="ai-attach"
                className="shrink-0"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("ai.placeholder")}
                className={`h-10 ${lang === "hi" ? "font-hindi" : ""}`}
                data-testid="ai-input"
              />
              <Button onClick={send} disabled={busy} data-testid="ai-send" size="icon" className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
