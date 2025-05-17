import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Message = sequelize.define('Message', {
  senderId: { type: DataTypes.STRING, allowNull: false },
  messageText: { type: DataTypes.TEXT, allowNull: false },
  responseText: { type: DataTypes.TEXT },
}, {
  timestamps: true,
});