import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isGroqReady } from './_lib/chat-logic.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'ok',
    provider: 'groq',
    hasApiKey: isGroqReady(),
    timestamp: new Date().toISOString()
  });
}
