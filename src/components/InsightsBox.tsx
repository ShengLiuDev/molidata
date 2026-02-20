import { Language, StatementData } from "@/types/statement";
import { getInsights, t } from "@/lib/i18n";
import { Lightbulb } from "lucide-react";

interface InsightsBoxProps {
  data: StatementData;
  lang: Language;
}

export function InsightsBox({ data, lang }: InsightsBoxProps) {
  return (
    <div className="print-section print-card rounded-xl border border-[hsl(var(--kpi-3)/0.3)] bg-[hsl(var(--kpi-3)/0.05)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--kpi-3)/0.15)] text-[hsl(var(--kpi-3))]">
          <Lightbulb className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{t(lang, "keyInsights")}</h3>
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">{getInsights(data, lang)}</p>
    </div>
  );
}
