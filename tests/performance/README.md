Để **test performance của hệ thống chatbot Node.js + Redis + PostgreSQL** (đang chạy Docker), bạn có thể áp dụng các công cụ và kỹ thuật sau để đo:

---

## ✅ MỤC TIÊU TEST

| Mục tiêu             | Đo lường gì?                           |
| -------------------- | -------------------------------------- |
| 🚀 Hiệu năng Webhook | Bao nhiêu request/s hệ thống chịu được |
| 🧠 Xử lý AI          | OpenAI/Gemini có bị nghẽn không?       |
| 🔁 Queue BullMQ      | Queue xử lý message có backlog?        |
| 🧱 DB & Redis        | Truy xuất/lưu trữ có bị bottleneck?    |

---

## 🛠️ 1. **Test hiệu năng Webhook với [k6](https://k6.io/)**

### ✅ Cài `k6`:

```bash
brew install k6          # macOS
sudo apt install k6      # Ubuntu
```

### ✅ Script test: `test.js`

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,            // 50 người dùng đồng thời
  duration: '30s',    // trong 30 giây
};

export default function () {
  const payload = JSON.stringify({
    entry: [{
      messaging: [{
        sender: { id: "test_user" },
        message: { text: "Hello chatbot" }
      }]
    }]
  });

  const headers = { 'Content-Type': 'application/json' };
  const res = http.post('http://localhost:3000/webhook', payload, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(0.1);
}
```

### ✅ Chạy test:

```bash
k6 run test.js
```

📊 Kết quả sẽ trả về:

* Req/s (request throughput)
* Duration trung bình
* % lỗi

---

## 🔁 2. **Giám sát Queue: BullMQ Dashboard**

Cài dashboard để xem queue có backlog không:

### 📦 Cài đặt (local hoặc add vào dự án):

```bash
pnpm add bull-board
```

### 📄 Thêm vào server:

```js
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { messageQueue } from './src/queue/messageQueue.js';

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new QueueAdapter(messageQueue)],
  serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());
```

👉 Truy cập: `http://localhost:3000/admin/queues`

---

## 📊 3. **Giám sát Redis & PostgreSQL**

### Redis:

* Dùng [RedisInsight](https://redis.com/redis-enterprise/redis-insight/) (GUI) kết nối vào Redis container.
* Hoặc CLI:

```bash
docker exec -it redis_chatbot redis-cli
> info stats
```

### PostgreSQL:

* Dùng `pg_stat_activity` để xem kết nối đang chạy:

```sql
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

* Hoặc cài `pgAdmin` hoặc sử dụng Grafana + PostgreSQL exporter nếu muốn giám sát chuyên sâu.

---

## 🚀 4. **Benchmark xử lý AI**

OpenAI/Gemini đều có giới hạn rate (ví dụ 60 req/min/user). Bạn có thể log thời gian xử lý:

### Ghi log thời gian gọi AI trong `aiService.js`:

```js
console.time("AI Response");
const reply = await generateAIReply(text);
console.timeEnd("AI Response");
```

Bạn sẽ thấy log như:

```
AI Response: 350 ms
```

📌 Nếu > 2s hoặc timeout, cần xử lý retry, queue hoặc giới hạn rate.

---

## 🔥 5. (Nâng cao) Dùng Artillery để stress test async + flow dài

```bash
npm install -g artillery
```

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 30
      arrivalRate: 20
scenarios:
  - flow:
      - post:
          url: "/webhook"
          json:
            entry:
              - messaging:
                  - sender:
                      id: "user_{{ $randomNumber(1,1000) }}"
                    message:
                      text: "hi bot"
```

---

## ✅ Tổng kết

| Mục tiêu         | Công cụ đề xuất                            |
| ---------------- | ------------------------------------------ |
| Test API Webhook | `k6`, `Artillery`                          |
| Giám sát Queue   | `bull-board`                               |
| Monitor Redis    | `RedisInsight`, `redis-cli info`           |
| PostgreSQL load  | `pg_stat_activity`, `pgAdmin`              |
| AI latency       | `console.time()` trong `generateAIReply()` |

---

Bạn muốn mình **tạo sẵn script test hiệu năng** cho webhook hoặc tích hợp giám sát real-time trong dự án?

