import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_INSTRUCTIONS: Record<string, string> = {
  en: "Respond in English.",
  zh: "Respond in simplified Chinese (简体中文).",
  es: "Respond in Spanish.",
};

const SYSTEM_PROMPT = `You are a helpful assistant for restaurant owners analyzing their ChowBus POS monthly statements. A PDF of the statement is attached to the first message in the conversation.

Answer the user's questions about the statement concisely and accurately. You can reference specific numbers, line items, fees, order channels, or any other data in the PDF. Keep answers focused and practical — these are busy restaurant owners.

If the user asks something not answerable from the statement, say so clearly.`;

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
    const { pdfBase64, messages, lang } = body;

    if (!pdfBase64) {
      return new Response(JSON.stringify({ error: "No PDF data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langInstruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.en;

    // Build the messages array for the API call.
    // The first user message includes the PDF document; subsequent messages
    // are plain text from the conversation history.
    const apiMessages = messages.map(
      (msg: { role: string; content: string }, idx: number) => {
        if (idx === 0 && msg.role === "user") {
          return {
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
              { type: "text", text: msg.content },
            ],
          };
        }
        return { role: msg.role, content: msg.content };
      }
    );

    const anthropicResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 2048,
          system: `${SYSTEM_PROMPT}\n\n${langInstruction}`,
          messages: apiMessages,
        }),
      }
    );

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      console.error(
        "Anthropic API error:",
        anthropicResponse.status,
        errorBody
      );

      if (anthropicResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "Rate limit exceeded. Please wait a moment and try again.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: `API error: ${anthropicResponse.status}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const reply = anthropicData.content?.[0]?.text;

    if (!reply) {
      throw new Error("Empty response from Claude");
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in chat-statement:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
