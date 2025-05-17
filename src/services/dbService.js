
import { Message } from '../models/Message.js';

export async function saveMessage(senderId, text, responseText = null) {
  return Message.create({ senderId, messageText: text, responseText });
}