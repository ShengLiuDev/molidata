import { useState, useRef, useEffect } from "react";
import { Language, ChatMessage } from "@/types/statement";
import { t } from "@/lib/i18n";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface ChatPanelProps {
  lang: Language;
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
}

export function ChatPanel({ lang, messages, isLoading, onSend }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="no-print fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-[hsl(var(--brand-dark))] transition-colors"
        aria-label={t(lang, "chatTitle")}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="no-print fixed bottom-6 right-6 z-50 flex w-[360px] max-h-[520px] flex-col rounded-2xl border border-border bg-card shadow-lg overflow-hidden sm:w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{t(lang, "chatTitle")}</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[380px]">
        {/* Welcome message */}
        {messages.length === 0 && !isLoading && (
          <div className="rounded-xl bg-secondary/60 px-3.5 py-2.5 text-sm text-muted-foreground">
            {t(lang, "chatWelcome")}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3.5 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t(lang, "chatPlaceholder")}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-[hsl(var(--brand-dark))] disabled:opacity-40 disabled:pointer-events-none"
            aria-label={t(lang, "chatSend")}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
