// src/services/aiService/geminiStrategy.js
import axios from 'axios';

export async function generateReply(messages) {
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY,
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini trả lời trống';
}
