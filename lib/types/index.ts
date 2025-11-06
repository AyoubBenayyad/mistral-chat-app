/**
 * Core types used throughout the application
 */

export type Role = 'user' | 'assistant' | 'system';

export type Message = {
  role: Role;
  content: string;
};

export type ModelType = 'mistral-tiny-latest' | 'mistral-small-latest' | 'mistral-large-latest';

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  model: ModelType;
  createdAt: number;
  updatedAt: number;
};

export type ChatState = {
  chats: Chat[];
  activeChat: string | null;
};