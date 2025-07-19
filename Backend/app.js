import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import msgRoutes from './routes/msgRoutes.js';
import userRoutes from './routes/userRoutes.js';
import socketHandler from './socket/socket.js';
import logger from './utils/logger.js';


dotenv.config();
connectDB();


const app = express();
const server = createServer(app);

const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet());
app.use(compression());
app.use(morgan(isProduction ? 'combined' : 'dev'));

const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL] 
  : ['http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true, 
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/msg", msgRoutes);
app.use("/api/user", userRoutes);

socketHandler(io);

app.get('/', (req, res) => {
  res.send('Welcome to the Socket.IO server!');
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);  // full stack
  logger.error(err.message || 'Unknown error');

  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,  // helpful during development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});


// 404 handler
// This catches all unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.log(`Server is running on http://localhost:${PORT}`);
});


// Graceful shutdown
process.on('SIGTERM', () => {
  logger.log('Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.log('Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});