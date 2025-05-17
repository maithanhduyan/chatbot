import axios from "axios";
import { redis } from "../config/redis.js";

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

const CONTEXT_LIMIT = 6;

export async function generateAIReplyWithContext(senderId, prompt) {
  const contextKey = `context:${senderId}`;

  // Lấy lịch sử từ Redis
  let history = await redis.get(contextKey);
  history = history ? JSON.parse(history) : [];

  // Thêm câu hỏi mới
  history.push({ role: "user", content: prompt });

  // Trim nếu quá dài
  if (history.length > CONTEXT_LIMIT) {
    history = history.slice(-CONTEXT_LIMIT);
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: history,
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    // Cập nhật context
    history.push({ role: "assistant", content: reply });
    if (history.length > CONTEXT_LIMIT) {
      history = history.slice(-CONTEXT_LIMIT);
    }
    await redis.set(contextKey, JSON.stringify(history), "EX", 3600); // TTL 1 giờ

    return reply;
  } catch (error) {
    console.error("Error generating contextual reply:", error);
    throw error;
  }
}
