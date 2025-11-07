"use client";

import React from 'react';
import { Message } from '@/lib/types';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 overflow-auto p-6 bg-white dark:bg-zinc-800">
      <div className="max-w-4xl mx-auto">
        <ul className="flex flex-col gap-6">
          {messages.filter(m => m.role !== 'system').map((m, i) => (
            <li
              key={i}
              className={`flex items-start gap-4 ${
                m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className="flex-shrink-0">
                {m.role === 'assistant' ? (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100 flex items-center justify-center shadow-md">
                    <img src="/icons8-ai.svg" alt="Mistral Logo" className="w-5 h-5 object-contain" />  
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
              </div>

              <div className={`${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col max-w-[75%]`}>
                <div className="text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400">
                  {m.role === 'assistant' ? 'Assistant' : 'You'}
                </div>
                <div
                  className={`text-sm whitespace-pre-wrap px-4 py-3 rounded-2xl shadow-sm ${
                    m.role === 'assistant'
                      ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-600'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            </li>
          ))}
          
          {isStreaming && (
            <li className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100 flex items-center justify-center shadow-md">
                  <img src="/icons8-ai.svg" alt="Mistral Logo" className="w-5 h-5 object-contain" />
                </div>
              </div>
              <div className="flex flex-col max-w-[75%]">
                <div className="text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400">
                  Assistant
                </div>
                <div className="text-sm whitespace-pre-wrap px-4 py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-600">
                  <span className="inline-flex items-center gap-1">
                    <span className="animate-pulse">Thinking</span>
                    <span className="flex gap-1">
                      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </span>
                </div>
              </div>
            </li>
          )}
          <div ref={bottomRef} />
        </ul>
      </div>
    </div>
  );
}