import { Language } from "@/types/statement";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  lang: Language;
  setLang: (l: Language) => void;
  className?: string;
}

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
  { code: "es", label: "ES" },
];

export function LanguageToggle({ lang, setLang, className }: LanguageToggleProps) {
  return (
    <div
      className={cn(
        "no-print inline-flex items-center rounded-lg border border-border bg-card p-0.5 shadow-sm",
        className
      )}
      role="group"
      aria-label="Language selector"
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={cn(
            "min-h-[36px] min-w-[44px] rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150",
            lang === code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
          )}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
