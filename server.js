import express from 'express';
import bodyParser from 'body-parser';
import webhookRouter from './src/routes/webhook.js';
import { sequelize } from './src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await sequelize.sync();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
