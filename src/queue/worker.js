import 'dotenv/config';
import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { sendTextMessage } from '../services/facebookApi.js';
import { generateAIReply } from '../services/aiService.js';
import { saveMessage } from '../services/dbService.js';

const worker = new Worker('messages', async job => {
  const { sender, message } = job.data;
  const text = message.text;

  await saveMessage(sender.id, text);
  const reply = await generateAIReply(text);
  await saveMessage(sender.id, text, reply);
  await sendTextMessage(sender.id, reply);
}, { connection: redis });

worker.on('completed', job => console.log(`✅ Job ${job.id} done.`));
worker.on('failed', (job, err) => console.error(`❌ Job ${job.id} failed:`, err));
