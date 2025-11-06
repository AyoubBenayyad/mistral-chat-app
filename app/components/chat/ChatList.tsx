"use client";

import React from 'react';
import { Chat } from '@/lib/types';

interface ChatListProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

/**
 * Displays a list of available chats
 * Allows switching between chats and deleting them
 */
export function ChatList({ chats, activeChat, onSelectChat, onDeleteChat }: ChatListProps) {
  return (
    <div className="w-64 bg-zinc-50 border-r border-zinc-200 p-4 flex flex-col gap-2">
      {chats.map(chat => (
        <div
          key={chat.id}
          className={`
            p-3 rounded-md cursor-pointer flex items-center justify-between
            ${chat.id === activeChat
              ? 'bg-blue-100 text-blue-900'
              : 'hover:bg-zinc-100'
            }
          `}
          onClick={() => onSelectChat(chat.id)}
        >
          <div className="flex-1 truncate text-sm">
            {chat.title}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChat(chat.id);
            }}
            className="text-zinc-400 hover:text-red-600 p-1"
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
      ))}
    </div>
  );
}