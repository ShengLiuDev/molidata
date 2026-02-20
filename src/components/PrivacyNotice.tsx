import { Lock } from "lucide-react";
import { Language } from "@/types/statement";
import { t } from "@/lib/i18n";

interface PrivacyNoticeProps {
  lang: Language;
  compact?: boolean;
}

export function PrivacyNotice({ lang, compact = false }: PrivacyNoticeProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3 w-3 flex-shrink-0" />
        <span>{t(lang, "privacyNotice")} — {t(lang, "privacyDetail")}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-5 rounded-xl border border-border bg-card/60 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--kpi-3)/0.1)] text-[hsl(var(--kpi-3))]">
          <Lock className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t(lang, "privacyNotice")}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {t(lang, "privacyDetail")}
          </p>
        </div>
      </div>
    </div>
  );
}
