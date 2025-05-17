Tuyệt vời! Bạn đang muốn **mở rộng backend chatbot** theo hướng **lưu lịch sử vào database** và **dùng AI (OpenAI hoặc Gemini)** để trả lời, sau đó **gửi lại tin nhắn về Facebook Messenger**. Đây là hướng thiết kế hiện đại và thông minh.

---

## ✅ Mục tiêu mới:

1. ✅ **Lưu lịch sử tin nhắn vào Database**
2. ✅ **Dùng OpenAI API (hoặc Gemini API) để sinh phản hồi**
3. ✅ **Gửi lại phản hồi qua Facebook Graph API**

---

## 🧠 Cập nhật kiến trúc

```
Facebook Messenger Webhook
        ↓
  Express Webhook Server
        ↓
 Push message vào Redis Queue (BullMQ)
        ↓
     Worker xử lý:
        ├── Lưu message vào DB
        ├── Gọi OpenAI / Gemini API để sinh phản hồi
        └── Gửi phản hồi qua Facebook API
```

---

## 🛠️ Công nghệ bổ sung

| Thành phần         | Gợi ý sử dụng                     |
| ------------------ | --------------------------------- |
| Database           | PostgreSQL (qua Sequelize/Prisma) |
| ORM                | Sequelize (Node.js)               |
| AI API             | OpenAI GPT-4 API / Gemini Pro     |
| Môi trường lưu trữ | `.env` mở rộng thêm keys          |

---

## 📁 Cập nhật cấu trúc thư mục

```
chatbot-backend/
│
├── models/                 # Sequelize models
│   └── Message.js
├── services/
│   ├── facebookApi.js
│   ├── aiService.js        # Gọi OpenAI/Gemini
│   └── dbService.js        # Lưu lịch sử chat
├── queue/
│   ├── messageQueue.js
│   └── worker.js           # Xử lý message → AI → gửi lại
├── server.js
└── .env
```

---

## 📄 `.env` mở rộng

```env
PAGE_ACCESS_TOKEN=your_fb_token
VERIFY_TOKEN=your_verify_token
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgres://user:pass@localhost:5432/chatdb
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
USE_MODEL=openai   # hoặc gemini
```

---

## 📄 `models/Message.js` (Sequelize model)

```js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

const Message = sequelize.define('Message', {
  senderId: { type: DataTypes.STRING, allowNull: false },
  messageText: { type: DataTypes.TEXT, allowNull: false },
  responseText: { type: DataTypes.TEXT },
}, {
  timestamps: true,
});

module.exports = { Message, sequelize };
```

---

## 📄 `services/dbService.js`

```js
const { Message, sequelize } = require('../models/Message');

async function saveMessage(senderId, text, responseText = null) {
  await sequelize.sync(); // đảm bảo bảng tồn tại
  return Message.create({ senderId, messageText: text, responseText });
}

module.exports = { saveMessage };
```

---

## 📄 `services/aiService.js`

```js
const axios = require('axios');

async function generateAIReply(prompt) {
  if (process.env.USE_MODEL === 'openai') {
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      }
    });
    return res.data.choices[0].message.content.trim();
  } else {
    // Gemini API
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    return res.data.candidates[0].content.parts[0].text;
  }
}

module.exports = { generateAIReply };
```

---

## 📄 `queue/worker.js` (mở rộng)

```js
require('dotenv').config();
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { sendTextMessage } = require('../services/facebookApi');
const { generateAIReply } = require('../services/aiService');
const { saveMessage } = require('../services/dbService');

const connection = new Redis(process.env.REDIS_URL);

const worker = new Worker('messages', async job => {
    const { sender, message } = job.data;
    const text = message.text;

    // 1. Lưu lịch sử tin nhắn
    await saveMessage(sender.id, text);

    // 2. Gọi AI sinh phản hồi
    const reply = await generateAIReply(text);

    // 3. Lưu phản hồi vào DB (cập nhật)
    await saveMessage(sender.id, text, reply);

    // 4. Gửi trả lời qua Facebook API
    await sendTextMessage(sender.id, reply);
}, { connection });

worker.on('completed', job => console.log(`✅ Job ${job.id} done.`));
worker.on('failed', (job, err) => console.error(`❌ Job ${job.id} failed:`, err));
```

---

## ✅ Ưu điểm thiết kế này:

* 📦 **Lưu trữ lịch sử chat** để phân tích, hiển thị lịch sử, huấn luyện AI.
* 🤖 **Tùy chọn dùng OpenAI hoặc Gemini** tùy nhu cầu/chi phí.
* ⚙️ **Tách rời các thành phần** (AI, DB, gửi message) → dễ scale và debug.

---

## 🚀 Mở rộng tiếp theo (gợi ý):

* Giao diện quản lý lịch sử chat (admin dashboard)
* Gửi hình ảnh, nút bấm (Facebook templates)
* Bộ lọc nội dung, kiểm duyệt tự động
* Giới hạn số lần gọi AI/người dùng/ngày

---

Nếu bạn muốn, mình có thể tạo một **template GitHub repo** cho cấu trúc này hoặc hướng dẫn cách deploy lên **Render / Railway / Vercel / Docker**. Bạn muốn tiếp tục theo hướng nào?
