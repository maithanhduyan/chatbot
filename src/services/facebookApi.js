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
