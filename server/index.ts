import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// ── Middleware ───────────────────────────────────────────────
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', dbConnected: false, timestamp: new Date().toISOString() });
});

// ── Socket.io ────────────────────────────────────────────────
io.on('connection', socket => {
  console.log(`[socket] connected: ${socket.id}`);

  socket.on('room:join', (payload: { conversationId: string; participantId: string; role: string }) => {
    const { conversationId, participantId, role } = payload;
    socket.join(conversationId);
    console.log(`[socket] ${role} ${participantId} joined room ${conversationId}`);
    // History will be emitted once DB is wired (Milestone 2)
    socket.emit('room:history', []);
  });

  socket.on('disconnect', () => {
    console.log(`[socket] disconnected: ${socket.id}`);
  });
});

// ── Start ────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[server] running at http://localhost:${PORT}`);
});
