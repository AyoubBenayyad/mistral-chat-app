"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ErrorMessage } from "@/app/components/shared/ErrorMessage";

function getErrorSuggestion(error: string): string {
  if (error.includes('service_tier_capacity_exceeded')) {
    return "Try switching to a different model, or wait a few minutes and try again.";
  }
  if (error.includes('Missing API key')) {
    return "The application is not properly configured. Please check your environment variables.";
  }
  if (error.includes('rate limit')) {
    return "You've sent too many messages too quickly. Please wait a moment before trying again.";
  }
  if (error.includes('500')) {
    return "There seems to be a temporary issue with the service. Please try again in a few minutes.";
  }
  if (error.includes('Network')) {
    return "Check your internet connection and try again.";
  }
  return "If this problem persists, try refreshing the page or using a different model.";
}

type Role = "user" | "assistant" | "system";

type Message = {
  role: Role;
  content: string;
};

export default function ChatUI() {
  // Chat UI: sends messages to /api/chat and renders streaming replies.
  // Kept intentionally small so we can extend it later.
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // request pending (before streaming)
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("mistral-small-latest");
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
      setIsLoading(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toSend, model: selectedModel }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // try to parse JSON details from server
        try {
          const parsed = JSON.parse(text || "{}");
          const msg = parsed.error || parsed.message || text || `HTTP ${res.status}`;
          throw new Error(msg + (parsed.details ? ` — ${parsed.details}` : ""));
        } catch (_e) {
          throw new Error(text || `HTTP ${res.status}`);
        }
      }

      // streaming begins
      setIsLoading(false);
      setIsStreaming(true);

      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      if (!res.body) {
        throw new Error("No response body from server.");
      }

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
                } catch (_e) {
                  // ignore malformed chunks; they don't break the stream
                }
              }
        }
      }

      reader.releaseLock();
    } catch (err: any) {
      // make error messages actionable for the user
      if (err?.name === "AbortError") {
        setError("Request cancelled.");
      } else {
        // show a concise message; keep raw detail for power users
        const msg = err?.message || String(err);
        setError(msg.replace(/\s*\n\s*/g, " ").slice(0, 1000));
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
      setIsLoading(false);
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
        <div className="flex items-center gap-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="mistral-tiny-latest">Mistral Tiny</option>
            <option value="mistral-small-latest">Mistral Small</option>
            <option value="mistral-large-latest">Mistral Large</option>
          </select>
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
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-white">
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full shadow-md border border-zinc-200">
          <div className="flex-1 overflow-auto p-6 bg-white">
            <ul className="flex flex-col gap-4">
              {messages.filter((m) => m.role !== "system").map((m, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-4 my-4 text-sm ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {m.role === "assistant" ? (
                      <Image
                        src="/icons8-ai.svg"
                        alt="AI"
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    ) : (
                      <Image
                        src="/icons8-user-30.png"
                        alt="You"
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    )}
                  </div>

                  <div className={`${m.role === "user" ? "text-right" : "text-left"} max-w-[80%]`}>
                    <div
                      className={`text-sm whitespace-pre-wrap px-4 py-3 ${m.role === "assistant" ? "bg-white border border-zinc-200 text-zinc-900 rounded-2xl shadow-sm" : "bg-blue-600 text-white rounded-2xl shadow-md"}`}
                    >
                      {m.content}
                    </div>
                  </div>
                </li>
              ))}
              {/* typing indicator while streaming */}
              {isStreaming && (
                <li className="flex items-start gap-4 my-4 text-sm">
                  <div className="flex-shrink-0">
                    <Image src="/icons8-ai.svg" alt="AI" width={36} height={36} className="rounded-full" />
                  </div>
                  <div className="max-w-[80%]">
                    <div className="text-sm whitespace-pre-wrap px-4 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-2xl shadow-sm">
                      <span className="animate-pulse">AI is typing<span className="ml-1">...</span></span>
                    </div>
                  </div>
                </li>
              )}
              <div ref={bottomRef} />
            </ul>
          </div>

          <div className="border-t border-zinc-200 p-4">
            {error && (
              <ErrorMessage
                message={error}
                suggestion={getErrorSuggestion(error)}
                onRetry={() => {
                  const last = [...messages].reverse().find((m) => m.role === "user");
                  if (last) {
                    setInput(last.content);
                    inputRef.current?.focus();
                  }
                }}
                onDismiss={() => setError(null)}
              />
            )}
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                aria-label="Type a message"
                placeholder="Type your message..."
                className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                ref={inputRef}
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={isLoading || isStreaming || !input.trim()}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {(isLoading || isStreaming) && (
                  <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                <span>{isLoading || isStreaming ? "Sending" : "Send"}</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}