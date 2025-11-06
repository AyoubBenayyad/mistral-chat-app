import { useState, useRef, useCallback } from 'react';
import { Message } from '@/types';

interface UseChatOperationsProps {
  onAddMessage: (message: Message) => void;
  onUpdateMessage: (update: (prevMessage: Message) => Message) => void;
  onError: (error: string) => void;
}

export function useChatOperations({ onAddMessage, onUpdateMessage, onError }: UseChatOperationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    messages: Message[],
    model: string
  ) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    onAddMessage(userMessage);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsLoading(true);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        try {
          const parsed = JSON.parse(text || '{}');
          const parsedDetails = parsed.details ? JSON.parse(parsed.details) : {};
          
          // Map server errors to user-friendly messages
          let userMessage = 'Something went wrong. Please try again.';
          if (parsedDetails.type === 'service_tier_capacity_exceeded') {
            userMessage = 'This model is experiencing high demand. Please try a different model or wait a few minutes.';
          } else if (parsed.error === 'Missing API key') {
            userMessage = 'The server configuration is incomplete. Please notify the administrator.';
          } else if (res.status === 429) {
            userMessage = 'Rate limit reached. Please wait a moment before sending another message.';
          } else if (res.status === 413) {
            userMessage = 'Your message is too long. Please try sending a shorter message.';
          } else if (res.status === 400) {
            userMessage = 'Invalid request. Please check your message and try again.';
          } else if (res.status >= 500) {
            userMessage = 'The service is temporarily unavailable. Please try again in a few minutes.';
          } else if (res.status === 401) {
            userMessage = 'Authentication error. Please refresh the page or contact support.';
          } else if (res.status === 403) {
            userMessage = 'You do not have permission to use this model. Please try a different one.';
          }
          throw new Error(userMessage);
        } catch (e) {
          throw new Error(text || `HTTP ${res.status}`);
        }
      }

      setIsLoading(false);
      setIsStreaming(true);

      // Add empty assistant message that will be updated with streamed content
      onAddMessage({ role: 'assistant', content: '' });

      if (!res.body) {
        throw new Error('No response body from server.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;

              if (delta) {
                onUpdateMessage((prevMessage) => ({
                  role: 'assistant',
                  content: prevMessage.content + delta
                }));
              }
            } catch (_e) {
              // ignore malformed chunks
            }
          }
        }
      }

      reader.releaseLock();
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        onError('Request cancelled.');
      } else {
        const msg = err?.message || String(err);
        onError(msg.replace(/\s*\n\s*/g, ' ').slice(0, 1000));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [onAddMessage, onUpdateMessage, onError]);

  return {
    isLoading,
    isStreaming,
    sendMessage,
    stopStreaming
  };
}