import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Determine allowed origins for CORS
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://spend-wise-rouge.vercel.app',
  frontendUrl,
].filter(Boolean);

// Helper to match Vercel preview/deployment URLs (e.g. project-xxx.vercel.app)
const isVercelOrigin = (origin) => {
  if (!origin) return false;
  try {
    const hostname = new URL(origin).hostname;
    return hostname.endsWith('.vercel.app') || hostname === 'vercel.app';
  } catch {
    return false;
  }
};

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    // Allow known origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // Allow any Vercel deployment domain (including preview branches)
    if (isVercelOrigin(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`CORS allowed unknown origin (dev): ${origin}`);
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.options('*', cors()); // Pre-flight for all routes
app.use(express.json({ limit: '50mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/transactions/export', exportRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('Expense Tracker API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('   Another backend is already running, or a previous one did not exit.');
    console.error('   Fix: close the other terminal, or run:');
    console.error(`   netstat -ano | findstr :${PORT}`);
    console.error('   taskkill /PID <pid> /F\n');
    process.exit(1);
  }
  throw err;
});
