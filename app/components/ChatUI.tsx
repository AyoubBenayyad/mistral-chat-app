"use client";

import React, { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";

type Message = {
  role: Role;
  content: string;
};

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const clearConversation = () => {
    if (isStreaming && abortRef.current) abortRef.current.abort();
    setMessages([{ role: "system", content: "You are a helpful assistant." }]);
    setInput("");
    setError(null);
  };

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const content = input.trim();
    if (!content) return;

    const userMsg: Message = { role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setError(null);

    const toSend = [...messages, userMsg];
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsStreaming(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toSend }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          
          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              
              if (delta) {
                setMessages((cur) => {
                  const copy = [...cur];
                  const idx = copy.length - 1;
                  if (idx >= 0 && copy[idx].role === "assistant") {
                    copy[idx] = { ...copy[idx], content: copy[idx].content + delta };
                  }
                  return copy;
                });
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }

      reader.releaseLock();
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Streaming aborted");
      } else {
        setError(err?.message || String(err));
        setMessages((cur) => {
          const copy = [...cur];
          const idx = copy.length - 1;
          if (idx >= 0 && copy[idx].role === "assistant") {
            copy[idx] = { ...copy[idx], content: copy[idx].content + "\n\n[Error receiving response]" };
          }
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  const stopStreaming = () => {
    if (abortRef.current) abortRef.current.abort();
  };

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mistral Chat</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={clearConversation}
            className="rounded-md bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
          >
            New
          </button>
          {isStreaming && (
            <button
              onClick={stopStreaming}
              className="rounded-md bg-yellow-50 px-3 py-1 text-sm text-yellow-700 hover:bg-yellow-100"
            >
              Stop
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto p-6">
            <ul className="flex flex-col gap-4">
              {messages.filter(m => m.role !== "system").map((m, i) => (
                <li key={i} className={`flex gap-4 my-4 text-sm ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0">
                    <div className="rounded-full bg-gray-100 border p-1 w-8 h-8 flex items-center justify-center">
                      {m.role === "assistant" ? (
                        <span className="text-sm font-medium text-gray-800">AI</span>
                      ) : (
                        <span className="text-sm font-medium text-gray-800">You</span>
                      )}
                    </div>
                  </div>
                  <div className={`${m.role === "user" ? "text-right" : "text-left"} max-w-[80%]`}>
                    <div className={`${m.role === "assistant" ? "rounded-md bg-zinc-50 p-3 text-zinc-900" : "rounded-md bg-blue-600 p-3 text-white"}`}>
                      <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                </li>
              ))}
              <div ref={bottomRef} />
            </ul>
          </div>

          <div className="border-t border-zinc-200 p-4">
            {error && (
              <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                aria-label="Type a message"
                placeholder="Type your message..."
                className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isStreaming ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}