import { Section, Language } from "@/types/statement";
import { getLabel, getNote, getTitle } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface SectionTableProps {
  section: Section;
  lang: Language;
}

export function SectionTable({ section, lang }: SectionTableProps) {
  return (
    <div className="print-section print-card rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-secondary/50 px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{getTitle(section, lang)}</h3>
      </div>
      <div className="divide-y divide-border">
        {section.items.map((item, i) => {
          const note = getNote(item, lang);
          return (
            <div
              key={i}
              className={cn(
                "flex items-baseline justify-between gap-4 px-5 py-3",
                i % 2 === 0 ? "bg-card" : "bg-secondary/20"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-foreground">{getLabel(item, lang)}</span>
                {note && <span className="text-xs text-muted-foreground">{note}</span>}
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums flex-shrink-0">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
