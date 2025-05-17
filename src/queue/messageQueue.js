import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

export const messageQueue = new Queue('messages', { connection: redis });

export async function addMessageToQueue(data) {
  await messageQueue.add('incomingMessage', data);
}
