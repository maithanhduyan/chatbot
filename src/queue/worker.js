import 'dotenv/config';
import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { sendTextMessage } from '../services/facebookApi.js';
import { generateAIReplyWithContext } from '../services/aiService/index.js';
import { saveMessage } from '../services/dbService.js';
import { dashboard } from '../../server.js'; // Đảm bảo export từ server.js

const worker = new Worker(
  'messages',
  async (job) => {
    try {
      const { sender, message } = job.data;
      const text = message.text;

      // Lưu message gốc từ user
      await saveMessage(sender.id, text);

      // Ghi nhận user hoạt động
      dashboard.trackUser(sender.id);

      // Gọi AI trả lời có context
      const reply = await generateAIReplyWithContext(sender.id, text, redis);

      // Lưu phản hồi vào DB
      await saveMessage(sender.id, text, reply);

      // Gửi trả lời lại qua Facebook Messenger
      await sendTextMessage(sender.id, reply);
    } catch (err) {
      console.error('❌ Job processing error:', err);
      throw err;
    }
  },
  {
    connection: redis,
  }
);

// Event log
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} done.`);
});
worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});
