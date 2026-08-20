import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatService } from "@/lib/api/services";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";

export default function ChatsPage() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const user = useAuthStore((s) => s.user);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [active, setActive] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoadingChats(true);
      setError("");
      try {
        const r = await chatService.myChats();
        const items = r.data || [];
        setChats(items);
        if (chatId) {
          const found = items.find((c) => c.id === chatId);
          if (found) setActive(found);
        } else if (items[0]) {
          setActive(items[0]);
          navigate(`/chats/${items[0].id}`, { replace: true });
        }
      } catch (e) {
        setError(e?.message || "Chats could not be loaded");
      } finally {
        setLoadingChats(false);
      }
    })();
  }, [chatId, navigate]);

  useEffect(() => {
    if (!active) return;
    (async () => {
      setLoadingMessages(true);
      setError("");
      try {
        const r = await chatService.getMessages(active.id);
        setMessages(r.data || []);
      } catch (e) {
        setError(e?.message || "Messages could not be loaded");
      } finally {
        setLoadingMessages(false);
      }
    })();
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!draft.trim() || !active) return;
    const text = draft.trim();
    setDraft("");
    try {
      const r = await chatService.sendMessage(active.id, text);
      setMessages((m) => [...m, r.data]);
      setChats((items) =>
        items.map((item) =>
          item.id === active.id ? { ...item, lastMessage: text, lastMessageAt: new Date().toISOString() } : item
        )
      );
    } catch (e) {
      setDraft(text);
      setError(e?.message || "Message could not be sent");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-0 lg:px-8 py-0 lg:py-6 h-[calc(100vh-72px)] lg:h-[calc(100vh-100px)]" data-testid="chats-page">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] h-full bg-card border border-border lg:rounded-2xl overflow-hidden">
        {/* sidebar */}
        <aside className={`border-r border-border ${active ? "hidden lg:flex" : "flex"} flex-col`}>
          <div className="px-4 py-4 border-b border-border">
            <h2 className="font-display text-xl">Chats</h2>
            <p className="text-xs text-muted-foreground">All your buyer-farmer conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loadingChats && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading conversations...
              </div>
            )}
            {!loadingChats && chats.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No conversations yet. Open a crop listing and tap "Chat with farmer".
              </div>
            )}
            {chats.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActive(c); navigate(`/chats/${c.id}`); }}
                data-testid={`chat-item-${c.id}`}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted/50 transition ${active?.id === c.id ? "bg-muted" : ""}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={c.other?.avatar} alt={c.other?.name || "User"} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {(c.other?.name || "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{c.other?.name || "User"}</p>
                    <span className="text-[10px] text-muted-foreground">{new Date(c.lastMessageAt || 0).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.lastMessage || "Start the conversation"}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* main */}
        <section className={`${active ? "flex" : "hidden lg:flex"} flex-col`}>
          {active ? (
            <>
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-3">
                <button onClick={() => { setActive(null); navigate("/chats"); }} className="lg:hidden text-sm text-muted-foreground">Back</button>
                <Avatar className="w-9 h-9">
                  <AvatarImage src={active.other?.avatar} alt={active.other?.name || "User"} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {(active.other?.name || "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-base leading-tight">{active.other?.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{active.other?.role}</p>
                </div>
              </div>
              {error && (
                <div className="px-5 py-2 bg-destructive/10 text-destructive text-xs border-b border-destructive/20">
                  {error}
                </div>
              )}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/20 scrollbar-thin">
                {loadingMessages && (
                  <p className="text-center text-sm text-muted-foreground py-12">Loading messages...</p>
                )}
                {messages.map((m) => {
                  const mine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${
                        mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                      }`}>
                        <p>{m.content}</p>
                        <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {!loadingMessages && messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-12">No messages yet.</p>
                )}
              </div>
              <div className="border-t border-border p-3 flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  className="h-11"
                  data-testid="chat-input"
                />
                <Button onClick={send} size="icon" className="h-11 w-11" data-testid="chat-send">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-center p-8">
              <div>
                <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">Pick a conversation to start chatting.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
