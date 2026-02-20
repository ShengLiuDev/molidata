import { StatementData, Language } from "@/types/statement";
import { t } from "@/lib/i18n";
import { HighlightGrid } from "./HighlightGrid";
import { OrderBreakdownTable } from "./OrderBreakdownTable";
import { SectionTable } from "./SectionTable";
import { InsightsBox } from "./InsightsBox";
import { LanguageToggle } from "./LanguageToggle";
import { Printer, UploadCloud } from "lucide-react";

interface SummaryViewProps {
  data: StatementData;
  lang: Language;
  setLang: (l: Language) => void;
  onReset: () => void;
}

export function SummaryView({ data, lang, setLang, onReset }: SummaryViewProps) {
  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand-light))] px-3 py-1 text-xs font-semibold text-primary mb-2">
            {data.period}
          </div>
          <h2 className="text-2xl font-bold text-foreground">{data.restaurant_name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t(lang, "summaryTitle")}</p>
        </div>
        <LanguageToggle lang={lang} setLang={setLang} className="self-start sm:self-auto" />
      </div>

      {/* KPI Highlight Cards */}
      <HighlightGrid highlights={data.highlights} lang={lang} />

      {/* Order Breakdown Table — full width, prominent */}
      {data.order_breakdown && data.order_breakdown.length > 0 && (
        <OrderBreakdownTable rows={data.order_breakdown} lang={lang} />
      )}

      {/* AI Insights */}
      <InsightsBox data={data} lang={lang} />

      {/* Remaining Data Sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.sections.map((section, i) => (
          <SectionTable key={i} section={section} lang={lang} />
        ))}
      </div>

      {/* Action Row */}
      <div className="no-print flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          onClick={onReset}
          className="min-h-[44px] flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          <UploadCloud className="h-4 w-4" />
          {t(lang, "uploadAnother")}
        </button>
        <button
          onClick={handlePrint}
          className="min-h-[44px] flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-[hsl(var(--brand-dark))] transition-colors"
        >
          <Printer className="h-4 w-4" />
          {t(lang, "printSummary")}
        </button>
      </div>

      {/* Print-only footer branding */}
      <div className="hidden print:block text-center text-xs text-muted-foreground border-t border-border pt-3 mt-4">
        {t(lang, "generatedBy")}
      </div>
    </div>
  );
}
