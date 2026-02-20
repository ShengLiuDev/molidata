import { FileText, Loader2 } from "lucide-react";
import { Language } from "@/types/statement";
import { t } from "@/lib/i18n";

interface FileBarProps {
  filename: string;
  lang: Language;
  isLoading: boolean;
  onAnalyze: () => void;
  onReset: () => void;
}

export function FileBar({ filename, lang, isLoading, onAnalyze, onReset }: FileBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-4 rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-light))] text-primary">
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{t(lang, "fileReady")}</p>
        <p className="text-sm font-semibold text-foreground truncate">{filename}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="min-h-[44px] px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          ✕
        </button>
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="min-h-[44px] flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-[hsl(var(--brand-dark))] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t(lang, "loading").replace("…", "")}</span>
            </>
          ) : (
            t(lang, "analyzeButton")
          )}
        </button>
      </div>
    </div>
  );
}
