import { NextRequest } from "next/server";
import { chatRequestSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const { messages, model = "mistral-small-latest" } = parsed.data;

    // Mistral API expects messages array directly
    const mistralPayload = {
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      stream: true,
    };

    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mistralPayload),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: "Mistral request failed", details: text }),
        { status: res.status, headers: { "content-type": "application/json" } }
      );
    }

    // Stream response back to client
    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}