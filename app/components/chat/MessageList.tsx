"use client";

import React from 'react';
import Image from 'next/image';
import { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
}

/**
 * Displays a list of chat messages with proper styling for each role
 * Includes typing indicator when streaming
 */
export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or when streaming
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 overflow-auto p-6 bg-white">
      <ul className="flex flex-col gap-4">
        {messages.filter(m => m.role !== 'system').map((m, i) => (
          <li
            key={i}
            className={`flex items-start gap-4 my-4 text-sm ${
              m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className="flex-shrink-0">
              {m.role === 'assistant' ? (
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

            <div className={`${m.role === 'user' ? 'text-right' : 'text-left'} max-w-[80%]`}>
              <div
                className={`text-sm whitespace-pre-wrap px-4 py-3 ${
                  m.role === 'assistant'
                    ? 'bg-white border border-zinc-200 text-zinc-900 rounded-2xl shadow-sm'
                    : 'bg-blue-600 text-white rounded-2xl shadow-md'
                }`}
              >
                {m.content}
              </div>
            </div>
          </li>
        ))}
        
        {/* Typing indicator while streaming */}
        {isStreaming && (
          <li className="flex items-start gap-4 my-4 text-sm">
            <div className="flex-shrink-0">
              <Image
                src="/icons8-ai.svg"
                alt="AI"
                width={36}
                height={36}
                className="rounded-full"
              />
            </div>
            <div className="max-w-[80%]">
              <div className="text-sm whitespace-pre-wrap px-4 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-2xl shadow-sm">
                <span className="animate-pulse">
                  AI is typing<span className="ml-1">...</span>
                </span>
              </div>
            </div>
          </li>
        )}
        <div ref={bottomRef} />
      </ul>
    </div>
  );
}