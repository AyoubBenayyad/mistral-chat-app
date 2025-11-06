"use client";

import React, { useState } from 'react';
import { ModelType } from '@/types';
import { useChatStorage } from '@/hooks/useChatStorage';
import { useChatOperations } from '@/hooks/useChatOperations';
import { ChatList } from '../chat/ChatList';
import { MessageList } from '../chat/MessageList';
import { ModelSelector } from '../ui/ModelSelector';

/**
 * Main Chat UI component
 * Orchestrates the chat functionality and manages the UI state
 */
export default function ChatUI() {
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  
  const {
    chats,
    activeChat,
    createChat,
    updateChat,
    deleteChat,
    setActiveChat,
    addMessage
  } = useChatStorage();

  const {
    isLoading,
    isStreaming,
    sendMessage,
    stopStreaming
  } = useChatOperations({
    onAddMessage: (message) => {
      if (!activeChat) return;
      addMessage(activeChat.id, message);
    },
    onUpdateMessage: (update) => {
      if (!activeChat) return;
      addMessage(activeChat.id, (messages) => {
        const newMessages = [...messages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          newMessages[newMessages.length - 1] = update(lastMessage);
        }
        return newMessages;
      });
    },
    onError: setError
  });

  // Create initial chat if none exists
  React.useEffect(() => {
    if (chats.length === 0) {
      createChat('mistral-small-latest' as ModelType);
    }
  }, [chats.length, createChat]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!activeChat || !input.trim()) return;
    
    const content = input.trim();
    setInput('');
    setError(null);
    
    await sendMessage(content, activeChat.messages, activeChat.model);
  };

  const handleNewChat = () => {
    if (isStreaming) stopStreaming();
    createChat('mistral-small-latest' as ModelType);
  };

  return (
    <div className="flex h-screen">
      <ChatList
        chats={chats}
        activeChat={activeChat?.id || null}
        onSelectChat={setActiveChat}
        onDeleteChat={deleteChat}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">
              {activeChat?.title || 'New Chat'}
            </h1>
            {activeChat && (
              <ModelSelector
                value={activeChat.model as ModelType}
                onChange={(model) => updateChat(activeChat.id, { model })}
                disabled={isStreaming || isLoading}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
            >
              New Chat
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

        {activeChat ? (
          <>
            <MessageList
              messages={activeChat.messages}
              isStreaming={isStreaming}
            />
            
            <div className="border-t border-zinc-200 p-4">
              {error && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  <div className="flex-1 pr-3">{error}</div>
                  <button
                    onClick={() => {
                      const lastUserMessage = [...activeChat.messages]
                        .reverse()
                        .find(m => m.role === 'user');
                      if (lastUserMessage) {
                        setInput(lastUserMessage.content);
                      }
                    }}
                    className="rounded-md bg-white px-3 py-1 text-xs text-zinc-900 border"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  disabled={isLoading || isStreaming || !input.trim()}
                  className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {(isLoading || isStreaming) && (
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  <span>
                    {isLoading || isStreaming ? 'Sending' : 'Send'}
                  </span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Select a chat or create a new one to begin
          </div>
        )}
      </div>
    </div>
  );
}