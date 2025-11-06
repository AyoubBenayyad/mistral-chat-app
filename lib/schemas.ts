// lib/schemas.ts
import { z } from 'zod';

// Simple message type used throughout the app
export const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

// Payload we accept at POST /api/chat
// Keep it minimal so it's easy to extend later
export const chatRequestSchema = z.object({
  messages: z.array(messageSchema),
  model: z.string().optional(),
});