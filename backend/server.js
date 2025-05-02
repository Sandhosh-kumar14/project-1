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



// Load environment variables
dotenv.config();


const allowedOrigins = [
  'https://front-end-alpha-beryl.vercel.app'
];

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Create socket.io connection
const onlineUsers = new Set();

io.use(verifySocketToken);

io.on('connection', (socket) => {
  console.log('New client connected', socket.userId);
  
  // Add user to online users
  onlineUsers.add(socket.userId);
  
  // Broadcast to all clients that this user is online
  socket.broadcast.emit('member_connected', socket.userId);
  
  // Send list of online users to the newly connected client
  socket.emit('online_members', Array.from(onlineUsers));
  
  // Join a room with the user's ID to allow direct messages
  socket.join(socket.userId);
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.userId);
    onlineUsers.delete(socket.userId);
    io.emit('member_disconnected', socket.userId);
  });
});

// Make io accessible to route handlers
app.set('io', io);

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: 'majority',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Start server only after successful DB connection
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Initial database connection
connectDB();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
