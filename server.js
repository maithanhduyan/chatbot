import express from 'express';
import bodyParser from 'body-parser';
import webhookRouter from './src/routes/webhook.js';
import { sequelize } from './src/config/db.js';

import { setupDashboard } from './src/monitor/dashboard.js';
import { createServer } from 'http';

import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const server = createServer(app);
const dashboard = setupDashboard(server);

// Dịch vụ file tĩnh trong thư mục /public
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use('/webhook', webhookRouter);

app.get('/', (req, res) => {
  res.send('server running... ok');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Cho worker gọi dashboard.trackUser()
export { dashboard };

// Route /dashboard chuyển hướng sang file tĩnh
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await sequelize.sync();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
