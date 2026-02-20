export type Language = "en" | "zh" | "es";

export interface Highlight {
  label_en: string;
  label_zh: string;
  label_es: string;
  value: string;
}

export interface OrderBreakdownRow {
  channel_en: string;
  channel_zh: string;
  channel_es: string;
  orders: string;
  revenue: string;
  tips: string;
  is_total: boolean;
}

export interface SectionItem {
  label_en: string;
  label_zh: string;
  label_es: string;
  value: string;
  note_en?: string;
  note_zh?: string;
  note_es?: string;
}

export interface Section {
  title_en: string;
  title_zh: string;
  title_es: string;
  items: SectionItem[];
}

export interface StatementData {
  period: string;
  restaurant_name: string;
  highlights: Highlight[];
  order_breakdown: OrderBreakdownRow[];
  sections: Section[];
  insights_en: string;
  insights_zh: string;
  insights_es: string;
}

export type AppState = "upload" | "file-ready" | "loading" | "summary" | "error";
