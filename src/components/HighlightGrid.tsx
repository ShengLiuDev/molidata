import { Highlight, Language } from "@/types/statement";
import { getLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const KPI_COLORS = [
  { bg: "bg-[hsl(var(--kpi-1)/0.08)]", text: "text-[hsl(var(--kpi-1))]", border: "border-[hsl(var(--kpi-1)/0.2)]" },
  { bg: "bg-[hsl(var(--kpi-2)/0.08)]", text: "text-[hsl(var(--kpi-2))]", border: "border-[hsl(var(--kpi-2)/0.2)]" },
  { bg: "bg-[hsl(var(--kpi-3)/0.08)]", text: "text-[hsl(var(--kpi-3))]", border: "border-[hsl(var(--kpi-3)/0.2)]" },
  { bg: "bg-[hsl(var(--kpi-4)/0.08)]", text: "text-[hsl(var(--kpi-4))]", border: "border-[hsl(var(--kpi-4)/0.2)]" },
  { bg: "bg-[hsl(var(--kpi-5)/0.08)]", text: "text-[hsl(var(--kpi-5))]", border: "border-[hsl(var(--kpi-5)/0.2)]" },
];

interface HighlightGridProps {
  highlights: Highlight[];
  lang: Language;
}

export function HighlightGrid({ highlights, lang }: HighlightGridProps) {
  return (
    <div className="kpi-grid grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {highlights.map((h, i) => {
        const color = KPI_COLORS[i % KPI_COLORS.length];
        return (
          <div
            key={i}
            className={cn(
              "print-card flex flex-col gap-2 rounded-xl border p-5 transition-shadow hover:shadow-md",
              color.bg,
              color.border
            )}
          >
            <span className={cn("text-xs font-semibold uppercase tracking-wider", color.text)}>
              {getLabel(h, lang)}
            </span>
            <span className="text-2xl font-bold text-foreground leading-none">{h.value}</span>
          </div>
        );
      })}
    </div>
  );
}
