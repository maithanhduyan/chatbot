# Cấu trúc Dự án như sau:

```
../chatbot
├── .env
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
├── postgresql
├── redis
├── server.js
└── src
    ├── config
    │   ├── db.js
    │   ├── env.js
    │   └── redis.js
    ├── models
    │   └── Message.js
    ├── queue
    │   ├── messageQueue.js
    │   └── worker.js
    ├── routes
    │   └── webhook.js
    ├── services
    │   ├── aiService.js
    │   ├── dbService.js
    │   └── facebookApi.js
    └── utils
        └── logger.js
```

# Danh sách chi tiết các file:

## File ../chatbot\docker-compose.yml:
```yaml
version: "3.9"

services:
  chatbot-app:
    build: .
    container_name: chatbot_app
    restart: always
    depends_on:
      - redis
      - postgres_main
    environment:
      REDIS_URL: redis://redis:6379
      DATABASE_URL: postgres://chatbot:chatbotpass@postgres_main:5432/chatbotdb
      VERIFY_TOKEN: your_verify_token
      PAGE_ACCESS_TOKEN: your_page_token
      OPENAI_API_KEY: your_openai_key
      GEMINI_API_KEY: your_gemini_key
      USE_MODEL: openai
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    working_dir: /app
    command: node server.js

  redis:
    image: redis:7
    container_name: redis_chatbot
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - ./redis/data:/data

  postgres_main:
    image: postgres:15
    container_name: postgres_main
    restart: always
    environment:
      POSTGRES_USER: chatbot
      POSTGRES_PASSWORD: chatbotpass
      POSTGRES_DB: chatbotdb
    ports:
      - "5432:5432"
    volumes:
      - ./postgresql/data:/var/lib/postgresql/data

```

## File ../chatbot\Dockerfile:
```
# Base image
FROM node:20

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json và cài dependencies
COPY package.json package-lock.json* ./
RUN pnpm install

# Copy toàn bộ mã nguồn
COPY . .

# Mở cổng mà app sử dụng
EXPOSE 3000

# Lệnh khởi động container
CMD ["node", "server.js"]

```

## File ../chatbot\server.js:
```javascript
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import webhookRouter from './src/routes/webhook.js';
import { sequelize } from './src/config/db.js';

const app = express();
app.use(bodyParser.json());
app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await sequelize.sync();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

```

## File ../chatbot\src\config\db.js:
```javascript
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

```

## File ../chatbot\src\config\env.js:
```javascript

```

## File ../chatbot\src\config\redis.js:
```javascript
import Redis from 'ioredis';
export const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

```

## File ../chatbot\src\models\Message.js:
```javascript
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Message = sequelize.define('Message', {
  senderId: { type: DataTypes.STRING, allowNull: false },
  messageText: { type: DataTypes.TEXT, allowNull: false },
  responseText: { type: DataTypes.TEXT },
}, {
  timestamps: true,
});
```

## File ../chatbot\src\queue\messageQueue.js:
```javascript
import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

export const messageQueue = new Queue('messages', { connection: redis });

export async function addMessageToQueue(data) {
  await messageQueue.add('incomingMessage', data);
}

```

## File ../chatbot\src\queue\worker.js:
```javascript
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

```

## File ../chatbot\src\routes\webhook.js:
```javascript
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

```

## File ../chatbot\src\services\aiService.js:
```javascript
import axios from "axios";

export async function generateAIReply(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating AI reply:", error);
    throw error;
  }
}

```

## File ../chatbot\src\services\dbService.js:
```javascript

import { Message } from '../models/Message.js';

export async function saveMessage(senderId, text, responseText = null) {
  return Message.create({ senderId, messageText: text, responseText });
}
```

## File ../chatbot\src\services\facebookApi.js:
```javascript
import axios from 'axios';

export async function sendTextMessage(recipientId, text) {
  const url = "https://graph.facebook.com/v12.0/me/messages";
  const params = {
    access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
  };
    const data = {
        recipient: {
        id: recipientId,
        },
        message: {
        text: text,
        },
    };
    try {
        const response = await axios.post(url, data, { params });
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
        throw new Error("Failed to send message");
    }
    
}

```

## File ../chatbot\src\utils\logger.js:
```javascript
export function log(...args) {
  console.log('[LOG]', ...args);
}

```

