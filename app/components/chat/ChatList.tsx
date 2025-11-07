"use client";

import React from 'react';
import { Chat } from '@/lib/types';

interface ChatListProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatList({ chats, activeChat, onSelectChat, onDeleteChat }: ChatListProps) {
  return (
    <div className="w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-2">
      <div className="mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 px-3">
          Conversations
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`
              group relative p-3 rounded-lg cursor-pointer transition-all
              ${chat.id === activeChat
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 shadow-sm'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
              }
            `}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 truncate text-sm font-medium">
                {chat.title}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded transition-all"
                title="Delete chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
            
            {chat.messages.length > 1 && (
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {chat.messages[chat.messages.length - 1]?.content.slice(0, 50)}...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}