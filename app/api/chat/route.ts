import { NextRequest } from "next/server";
import { chatRequestSchema } from "@/lib/schemas";

// Proxy POST /api/chat to Mistral.
// Accepts { messages, model? } and forwards a streaming response.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // validate shape
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const { messages, model = "mistral-small-latest" } = parsed.data;
    // Make sure we have an API key configured before calling Mistral
    if (!process.env.MISTRAL_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key", details: "Set MISTRAL_API_KEY in server environment." }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // build a simple payload we can extend later
    const payload = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    };

    const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!mistralRes.ok) {
      const text = await mistralRes.text().catch(() => "");
      return new Response(JSON.stringify({ error: "Mistral request failed", details: text }), {
        status: mistralRes.status,
        headers: { "content-type": "application/json" },
      });
    }

    // forward the stream as-is
    return new Response(mistralRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}