import { QueueEvents, Queue } from 'bullmq';
import { redis } from '../config/redis.js';
import { Server } from 'socket.io';

const queue = new Queue('messages', { connection: redis });
const queueEvents = new QueueEvents('messages', { connection: redis });

let stats = {
  activeJobs: 0,
  completedJobs: 0,
  failedJobs: 0,
  users: new Set(), // set of senderId
};

export function setupDashboard(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on('connection', socket => {
    socket.emit('stats', formatStats());
  });

  // Theo dõi các sự kiện queue
  queueEvents.on('active', ({ jobId }) => {
    stats.activeJobs++;
    io.emit('stats', formatStats());
  });

  queueEvents.on('completed', ({ jobId }) => {
    stats.activeJobs = Math.max(stats.activeJobs - 1, 0);
    stats.completedJobs++;
    io.emit('stats', formatStats());
  });

  queueEvents.on('failed', ({ jobId }) => {
    stats.activeJobs = Math.max(stats.activeJobs - 1, 0);
    stats.failedJobs++;
    io.emit('stats', formatStats());
  });

  return {
    trackUser(senderId) {
      stats.users.add(senderId);
      io.emit('stats', formatStats());
    }
  };
}

function formatStats() {
  return {
    activeJobs: stats.activeJobs,
    completedJobs: stats.completedJobs,
    failedJobs: stats.failedJobs,
    activeUsers: stats.users.size
  };
}
