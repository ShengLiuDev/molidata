import { Loader2 } from "lucide-react";
import { Language } from "@/types/statement";
import { t } from "@/lib/i18n";

interface LoadingViewProps {
  lang: Language;
}

export function LoadingView({ lang }: LoadingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-[hsl(var(--brand-light))]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">{t(lang, "loading")}</p>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{t(lang, "loadingSubtext")}</p>
      </div>
    </div>
  );
}
