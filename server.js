import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import webhookRouter from './src/routes/webhook.js';
import { sequelize } from './src/config/db.js';
import { setupDashboard } from './src/monitor/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app); // 👉 Socket.io sẽ gắn vào server này
const dashboard = setupDashboard(server); // 👉 truyền server vào đây

app.use(bodyParser.json());
app.use('/webhook', webhookRouter);

// Phục vụ file dashboard
app.use(express.static(path.join(__dirname, 'public')));
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/', (req, res) => {
  res.send('server running... ok');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  await sequelize.sync();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// 👉 Export cho worker gọi dashboard.trackUser
export { dashboard };
