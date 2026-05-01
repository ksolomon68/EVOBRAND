// server.js — EVOBRAND WordPress Maintenance CMS
// Run: node server.js
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ─── App setup ───────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: { origin: '*' }
});

const PORT = process.env.CMS_PORT || 3500;
const SECRET = process.env.SESSION_SECRET || 'evobrand-cms-secret-2024';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 8 * 60 * 60 * 1000 } // 8 hours
}));

// ─── Auth guard ───────────────────────────────────────────────────────────────
export function requireAuth(req, res, next) {
  if (req.session?.authenticated) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Unauthorized' });
  res.redirect('/login');
}

// ─── Socket.io — expose to routes ────────────────────────────────────────────
app.set('io', io);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/api', requireAuth, apiRouter);

// Login page
app.get('/login', (req, res) => {
  if (req.session?.authenticated) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Main CMS (SPA)
app.get('*', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Socket.io connection ─────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('CMS client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('CMS client disconnected:', socket.id);
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════════╗`);
  console.log(`  ║  EVOBRAND Maintenance CMS                ║`);
  console.log(`  ║  http://localhost:${PORT}                   ║`);
  console.log(`  ╚══════════════════════════════════════════╝\n`);
  console.log(`  Default credentials: admin / evobrand2024`);
  console.log(`  Change these in .env (CMS_ADMIN_USER, CMS_ADMIN_PASS)\n`);
});

export { io };
