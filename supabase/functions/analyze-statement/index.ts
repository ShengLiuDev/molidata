import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a financial data extraction assistant for ChowBus POS restaurant statements.

Analyze the provided PDF restaurant statement and return ONLY a valid JSON object matching EXACTLY this schema. No markdown, no code blocks, no explanation — just raw JSON.

{
  "period": "string — reporting period e.g. 'January 2026'",
  "restaurant_name": "string — restaurant name from the statement header",
  "highlights": [
    {
      "label_en": "string",
      "label_zh": "string",
      "label_es": "string",
      "value": "string — formatted value e.g. '$82,638.93'"
    }
  ],
  "order_breakdown": [
    {
      "channel_en": "string — channel name in English",
      "channel_zh": "string — channel name in simplified Chinese",
      "channel_es": "string — channel name in Spanish",
      "orders": "string — formatted integer e.g. '1,260'",
      "revenue": "string — formatted USD e.g. '$72,759.26'",
      "tips": "string — formatted USD or '$0.00' if not applicable",
      "is_total": false
    }
  ],
  "sections": [
    {
      "title_en": "string",
      "title_zh": "string",
      "title_es": "string",
      "items": [
        {
          "label_en": "string",
          "label_zh": "string",
          "label_es": "string",
          "value": "string",
          "note_en": "string or empty string",
          "note_zh": "string or empty string",
          "note_es": "string or empty string"
        }
      ]
    }
  ],
  "insights_en": "2-3 sentence plain-language business insight for the restaurant owner in English",
  "insights_zh": "Same insights in Mandarin Chinese (简体中文)",
  "insights_es": "Same insights in Spanish"
}

The highlights array must include exactly these 4 KPIs (in order):
1. Net Sales
2. Total Orders
3. Service Tips
4. Total Payout Amount

The order_breakdown array is CRITICAL. It must contain one row per order channel found in the statement, plus a final Total row.
- Look for ALL of these channels and include them if present: Dine In, Carry Out (Take Out), Kiosk, Online Delivery (DoorDash, Uber Eats, Grubhub, etc.), Call In
- For each channel, extract: number of orders, net revenue/sales, and tips (if available per channel; use '$0.00' if tips are not broken out per channel)
- The LAST entry in the array must be the Total row with is_total: true, summing all channels
- If a channel has zero orders, still include it with orders: "0", revenue: "$0.00", tips: "$0.00"
- Channel names in English must be exactly: "Dine In", "Carry Out", "Kiosk", "Online Delivery", "Call In", "Total"
- Channel names in Chinese (简体中文): "堂食", "外带", "自助点餐机", "线上外卖", "电话点餐", "合计"
- Channel names in Spanish: "Comer Aquí", "Para Llevar", "Quiosco", "Entrega en Línea", "Por Teléfono", "Total"

The sections array must include ALL of these sections in order:
1. Sales Summary (all sales fields: Gross Sales, Discounts, Net Sales Refunds, Net Sales, Taxes, Service Tips, Voided Items, Amount Receivable)
2. Payment Methods (each payment method with amount)
3. Top Categories by Order Volume (top 5)
4. Top Categories by Revenue (top 5)
5. Fees & Payout (all fee line items and total payout)

All label_zh values must be in simplified Chinese (简体中文).
All label_es values must be in Spanish.
All values must remain in USD. Never translate currency or numbers.
Return ONLY the JSON object, nothing else.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const body = await req.json();
    const { pdfBase64, filename } = body;

    if (!pdfBase64) {
      return new Response(JSON.stringify({ error: "No PDF data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: `Please analyze this ChowBus monthly POS statement${filename ? ` (${filename})` : ""} and return the structured JSON data as specified.`,
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errorBody);
      
      if (anthropicResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `API error: ${anthropicResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const rawContent = anthropicData.content?.[0]?.text;

    if (!rawContent) {
      throw new Error("Empty response from Claude");
    }

    // Strip any markdown code blocks if present
    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Validate it's parseable JSON
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in analyze-statement:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
