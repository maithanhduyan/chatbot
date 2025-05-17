import express from 'express';
import { addMessageToQueue } from '../queue/messageQueue.js';

const router = express.Router();

// Xác thực webhook của Facebook
router.get('/', (req, res) => {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    return res.send(req.query['hub.challenge']);
  }
  res.sendStatus(403);
});

// Nhận tin nhắn
router.post('/', async (req, res) => {
  const entries = req.body.entry || [];
  for (const entry of entries) {
    for (const event of entry.messaging || []) {
      if (event.message && event.sender) {
        await addMessageToQueue(event);
      }
    }
  }
  res.sendStatus(200);
});

export default router;
