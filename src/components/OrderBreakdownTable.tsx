import { OrderBreakdownRow, Language } from "@/types/statement";
import { getChannel, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface OrderBreakdownTableProps {
  rows: OrderBreakdownRow[];
  lang: Language;
}

const CHANNEL_ICONS: Record<string, string> = {
  "Dine In": "🍜",
  "Carry Out": "🥡",
  "Kiosk": "🖥️",
  "Online Delivery": "📱",
  "Call In": "📞",
  "Total": "∑",
};

export function OrderBreakdownTable({ rows, lang }: OrderBreakdownTableProps) {
  const dataRows = rows.filter((r) => !r.is_total);
  const totalRow = rows.find((r) => r.is_total);

  return (
    <div className="print-section print-card rounded-xl border border-border bg-card overflow-hidden">
      {/* Section header */}
      <div className="border-b border-border bg-secondary/50 px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{t(lang, "orderBreakdownTitle")}</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(lang, "colChannel")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(lang, "colOrders")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(lang, "colRevenue")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(lang, "colTips")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dataRows.map((row, i) => {
              const icon = CHANNEL_ICONS[row.channel_en] || "•";
              const isEmpty = row.orders === "0" || row.orders === "";
              return (
                <tr
                  key={i}
                  className={cn(
                    "transition-colors",
                    isEmpty
                      ? "opacity-40"
                      : i % 2 === 0
                      ? "bg-card hover:bg-secondary/20"
                      : "bg-secondary/10 hover:bg-secondary/30"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none" aria-hidden="true">{icon}</span>
                      <span className="font-medium text-foreground">{getChannel(row, lang)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{row.orders}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{row.revenue}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{row.tips}</td>
                </tr>
              );
            })}
          </tbody>
          {totalRow && (
            <tfoot>
              <tr className="border-t-2 border-border bg-primary/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-black text-primary">Σ</span>
                    <span className="font-bold text-foreground">{getChannel(totalRow, lang)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-foreground">{totalRow.orders}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-foreground">{totalRow.revenue}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-foreground">{totalRow.tips}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
