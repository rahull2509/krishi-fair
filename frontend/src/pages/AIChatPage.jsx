import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Bot, Image as ImageIcon, Send, Sparkles } from "lucide-react";
import { aiService } from "@/lib/api/services";
import { useUIStore } from "@/store/uiStore";
import { useT } from "@/lib/i18n";

const SUGGESTIONS = [
  { en: "Why are my wheat leaves turning yellow?", hi: "मेरी गेहूं की पत्तियाँ पीली क्यों हो रही हैं?" },
  { en: "When should I irrigate my onion field this week?", hi: "इस हफ़्ते प्याज़ की सिंचाई कब करूं?" },
  { en: "Best time to harvest paddy in Punjab?", hi: "पंजाब में धान की कटाई का सही समय?" },
  { en: "Identify pest from photo of leaf", hi: "पत्ती की फ़ोटो से कीट पहचानो" },
];

export default function AIChatPage() {
  const t = useT();
  const lang = useUIStore((s) => s.language);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        lang === "hi"
          ? "नमस्ते किसान भाई/बहन! मैं कृषि AI हूँ। फसल, सिंचाई, मौसम, या रोग के बारे में पूछें — चाहे तो पत्ती की फ़ोटो भेजें।"
          : "Namaste! I am Krishi AI. Ask anything about your crop — irrigation, weather, pest control. You can also attach a leaf photo for diagnosis.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [aiLang, setAiLang] = useState(lang === "hi" ? "Hindi" : "English");
  const fileRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages]);

  const handleFile = (e) => {
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
      const r = await aiService.chat({ message: userMsg.content, language: aiLang, imageDataUrl: img });
      setMessages((m) => [...m, { role: "assistant", content: r.data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: e?.message || "Error" }]);
    }
    setBusy(false);
  };

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-72px)]" data-testid="ai-chat-page">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground">
            <Bot className="w-6 h-6" />
          </span>
          <div>
            <p className="label-eyebrow text-primary">◇ Multilingual</p>
            <h1 className="font-display text-3xl lg:text-4xl">{t("ai.title")}</h1>
          </div>
        </div>
        <p className="mt-3 text-muted-foreground max-w-xl">{t("ai.intro")}</p>

        <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[68vh]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  {m.image && <img src={m.image} alt="" className="mb-2 rounded-lg max-h-40" />}
                  <div className={`[&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold ${lang === "hi" ? "font-hindi" : ""}`}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" /> {t("ai.thinking")}
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => {
              const text = lang === "hi" ? s.hi : s.en;
              return (
                <button
                  key={i}
                  onClick={() => send(text)}
                  className={`text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:text-primary transition ${lang === "hi" ? "font-hindi" : ""}`}
                  data-testid={`ai-suggestion-${i}`}
                >
                  {text}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border p-3 flex flex-col gap-2">
            {imageDataUrl && (
              <div className="flex items-center gap-2 bg-muted rounded-md px-2 py-1.5">
                <img src={imageDataUrl} alt="preview" className="w-12 h-12 rounded object-cover" />
                <span className="text-xs flex-1 truncate">Attached image (will be analysed)</span>
                <button onClick={() => setImageDataUrl(null)} className="text-xs text-destructive">Remove</button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Select value={aiLang} onValueChange={setAiLang}>
                <SelectTrigger className="w-[120px] h-11" data-testid="ai-language-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">हिन्दी</SelectItem>
                  <SelectItem value="Marathi">मराठी</SelectItem>
                  <SelectItem value="Punjabi">ਪੰਜਾਬੀ</SelectItem>
                  <SelectItem value="Tamil">தமிழ்</SelectItem>
                  <SelectItem value="Telugu">తెలుగు</SelectItem>
                  <SelectItem value="Bengali">বাংলা</SelectItem>
                  <SelectItem value="Gujarati">ગુજરાતી</SelectItem>
                  <SelectItem value="Kannada">ಕನ್ನಡ</SelectItem>
                </SelectContent>
              </Select>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} data-testid="ai-page-file" />
              <Button variant="outline" onClick={() => fileRef.current?.click()} className="h-11" data-testid="ai-page-attach">
                <ImageIcon className="w-4 h-4 mr-1.5" />
                {t("ai.upload")}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("ai.placeholder")}
                className={`h-11 flex-1 ${lang === "hi" ? "font-hindi" : ""}`}
                data-testid="ai-page-input"
              />
              <Button onClick={() => send()} disabled={busy} className="h-11" data-testid="ai-page-send">
                <Send className="w-4 h-4 mr-1.5" />
                {t("ai.send")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
