// src/services/aiService/index.js
import * as openai from './openaiStrategy.js';
import * as gemini from './geminiStrategy.js';

const strategies = {
  openai,
  gemini,
};

const selected = process.env.USE_MODEL || 'openai';
const strategy = strategies[selected];

if (!strategy) throw new Error(`AI Strategy ${selected} not found`);

export async function generateAIReplyWithContext(senderId, prompt, redis) {
  const key = `context:${senderId}`;
  let history = await redis.get(key);
  history = history ? JSON.parse(history) : [];

  history.push({ role: 'user', content: prompt });
  if (history.length > 6) history = history.slice(-6);

  const reply = await strategy.generateReply(history);

  history.push({ role: 'assistant', content: reply });
  if (history.length > 6) history = history.slice(-6);

  await redis.set(key, JSON.stringify(history), 'EX', 3600);

  return reply;
}
