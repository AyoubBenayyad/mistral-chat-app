import { useState, useEffect, useCallback } from 'react';
import { Chat, ChatState, Message, ModelType } from '@/types';
import { loadFromStorage, saveToStorage, createNewChat } from '@/utils/storage';

/**
 * Custom hook for managing chat state with persistence
 * Handles loading/saving chats and managing the active chat
 */
export function useChatStorage() {
  const [state, setState] = useState<ChatState>({
    chats: [],
    activeChat: null
  });

  // Load chats from storage on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setState(saved);
    }
  }, []);

  // Save chats to storage whenever they change
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Create a new chat and set it as active
  const createChat = useCallback((model: ModelType) => {
    setState(prev => {
      const newChat = createNewChat(model);
      return {
        chats: [...prev.chats, newChat],
        activeChat: newChat.id
      };
    });
  }, []);

  // Update an existing chat
  const updateChat = useCallback((chatId: string, updates: Partial<Chat>) => {
    setState(prev => ({
      ...prev,
      chats: prev.chats.map(chat => 
        chat.id === chatId
          ? { ...chat, ...updates, updatedAt: Date.now() }
          : chat
      )
    }));
  }, []);

  // Delete a chat
  const deleteChat = useCallback((chatId: string) => {
    setState(prev => ({
      chats: prev.chats.filter(chat => chat.id !== chatId),
      activeChat: prev.activeChat === chatId
        ? prev.chats.find(c => c.id !== chatId)?.id || null
        : prev.activeChat
    }));
  }, []);

  // Set the active chat
  const setActiveChat = useCallback((chatId: string | null) => {
    setState(prev => ({
      ...prev,
      activeChat: chatId
    }));
  }, []);

  // Add or update a message in a chat
  const addMessage = useCallback((chatId: string, message: Message | ((prev: Message[]) => Message[])) => {
    setState(prev => ({
      ...prev,
      chats: prev.chats.map(chat => 
        chat.id === chatId
          ? {
              ...chat,
              messages: typeof message === 'function' 
                ? message(chat.messages)
                : [...chat.messages, message],
              updatedAt: Date.now(),
              // Set title from first user message if it's still default
              title: chat.title === 'New Chat' && 
                     typeof message !== 'function' && 
                     message.role === 'user'
                ? message.content.slice(0, 50)
                : chat.title
            }
          : chat
      )
    }));
  }, []);

  // Get the currently active chat
  const activeChat = state.chats.find(chat => chat.id === state.activeChat);

  return {
    chats: state.chats,
    activeChat,
    createChat,
    updateChat,
    deleteChat,
    setActiveChat,
    addMessage
  };
}