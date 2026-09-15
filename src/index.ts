import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import streamRoutes from './routes/streams.js';
import invoiceRoutes from './routes/invoices.js';
import subscriptionRoutes from './routes/subscriptions.js';
import { errorHandler, requestLogger } from './middleware/validation.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    network: process.env.STELLAR_NETWORK || 'testnet',
  });
});

// API info
app.get('/api', (_req, res) => {
  res.json({
    name: 'web3-suite-payments-backend',
    version: '0.1.0',
    description: 'Payment API for Stellar/Soroban web3-suite',
    endpoints: {
      streams: {
        'GET /api/streams/:id': 'Get stream details',
        'POST /api/streams': 'Create a new payment stream',
        'POST /api/streams/:id/withdraw': 'Withdraw from stream',
        'POST /api/streams/:id/pause': 'Pause stream',
        'POST /api/streams/:id/resume': 'Resume stream',
        'POST /api/streams/:id/stop': 'Stop stream',
        'GET /api/streams/:id/withdrawable': 'Get withdrawable amount',
      },
      invoices: {
        'GET /api/invoices/:id': 'Get invoice details',
        'POST /api/invoices': 'Create a new invoice',
        'POST /api/invoices/:id/send': 'Send invoice',
        'POST /api/invoices/:id/pay': 'Pay invoice',
        'POST /api/invoices/:id/cancel': 'Cancel invoice',
      },
      subscriptions: {
        'GET /api/subscriptions/plans/:id': 'Get plan details',
        'POST /api/subscriptions/plans': 'Create subscription plan',
        'POST /api/subscriptions/subscribe': 'Subscribe to plan',
        'POST /api/subscriptions/:id/billing': 'Process billing',
        'POST /api/subscriptions/:id/cancel': 'Cancel subscription',
        'GET /api/subscriptions/:id': 'Get subscription details',
      },
    },
  });
});

// Routes
app.use('/api/streams', streamRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Network: ${process.env.STELLAR_NETWORK || 'testnet'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
