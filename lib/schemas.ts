// lib/schemas.ts
import { z } from 'zod';

// This is the improved schema from your example
export const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

// We'll keep the request schema simple for our frontend
// It only needs to send the list of messages
export const chatRequestSchema = z.object({
  messages: z.array(messageSchema),
  // optional model field so callers may request a specific model
  model: z.string().optional(),
});