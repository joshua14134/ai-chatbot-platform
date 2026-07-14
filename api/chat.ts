import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleChatRequest, type ChatRequestBody } from './_lib/chat-logic.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ChatRequestBody;
    const result = await handleChatRequest(body ?? {});
    return res.status(200).json(result);
  } catch (err: any) {
    const statusCode = err?.statusCode ?? 500;
    console.error('Error handling /api/chat:', err);
    return res.status(statusCode).json({ error: err?.message || 'Internal server error' });
  }
}
