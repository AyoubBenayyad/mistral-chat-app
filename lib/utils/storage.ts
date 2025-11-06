import { Chat, ChatState, ModelType } from '@/lib/types';

const STORAGE_KEY = 'mistral-chats-v1';

/**
 * Loads chat data from localStorage
 * Returns null if no data exists or if there's an error
 */
export function loadFromStorage(): ChatState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data) as ChatState;
    
    // Ensure the data has the correct shape
    if (!Array.isArray(parsed.chats)) return null;
    
    return {
      chats: parsed.chats.map(chat => ({
        ...chat,
        // Ensure timestamps exist
        createdAt: chat.createdAt || Date.now(),
        updatedAt: chat.updatedAt || Date.now()
      })),
      activeChat: parsed.activeChat
    };
  } catch (e) {
    console.error('Error loading chats from storage:', e);
    return null;
  }
}

/**
 * Saves chat data to localStorage
 * Uses a debounced approach to prevent too frequent writes
 */
export const saveToStorage = debounce((state: ChatState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving chats to storage:', e);
  }
}, 1000);

/**
 * Creates a new chat with default values
 */
export function createNewChat(model: ModelType): Chat {
  return {
    id: generateId(),
    title: 'New Chat',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' }
    ],
    model,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Generates a unique ID for new chats
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Simple debounce function to prevent excessive storage writes
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}