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

const allowedOrigins = [
  'https://precious-cactus-86ca12.netlify.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

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
  console.log('New client connected', socket.userId);
  onlineUsers.add(socket.userId);
  socket.broadcast.emit('member_connected', socket.userId);
  socket.emit('online_members', Array.from(onlineUsers));
  socket.join(socket.userId);

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.userId);
    onlineUsers.delete(socket.userId);
    io.emit('member_disconnected', socket.userId);
  });
});

app.set('io', io);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: 'majority',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
