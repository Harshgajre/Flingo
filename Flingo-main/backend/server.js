import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import path from 'path';
import { app, server } from './socket/socket.js';

dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: true, // Allow any origin for local network testing
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.send('Flingo API is running...');
});

// Database connectivity check for API routes
app.use('/api', (req, res, next) => {
  const state = mongoose.connection.readyState;
  if (state !== 1 && state !== 2) {
    return res.status(503).json({
      message: 'Database not connected. Please start MongoDB or provide a valid MONGO_URI in backend/.env'
    });
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stories', storyRoutes);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
