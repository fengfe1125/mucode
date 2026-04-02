import { Router } from 'express';
import { getConfig, saveConfig } from '../config';
import { handleChat } from '../llm/orchestrator';

export const apiRouter = Router();

apiRouter.get('/config', (req, res) => {
  const config = getConfig();
  // Strip actual keys for frontend display if needed, but since it's local we can send them
  res.json(config);
});

apiRouter.post('/config', (req, res) => {
  const updated = saveConfig(req.body);
  res.json(updated);
});

apiRouter.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Server-Sent Events (SSE) setup for streaming responses
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await handleChat(messages, (chunk: any) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});
