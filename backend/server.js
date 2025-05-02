import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import { verifySocketToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Allowed frontend origins
const allowedOrigins = [
  'https://precious-cactus-86ca12.netlify.app',
  'http://localhost:5173',
];

// ✅ CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Preflight support
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

const onlineUsers = new Set();

io.use(verifySocketToken);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.userId);
  onlineUsers.add(socket.userId);

  socket.broadcast.emit('member_connected', socket.userId);
  socket.emit('online_members', Array.from(onlineUsers));
  socket.join(socket.userId);

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.userId);
    onlineUsers.delete(socket.userId);
    io.emit('member_disconnected', socket.userId);
  });
});

app.set('io', io);

// ✅ MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: 'majority',
    });
    console.log('MongoDB connected');

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    setTimeout(connectDB, 5000); // Retry after 5s
  }
};

connectDB();

// ✅ Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', promise, 'reason:', reason);
  process.exit(1);
});
