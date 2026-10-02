import express from 'express';
import { logger } from './logger.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { authenticate } from './middleware/auth.ts';
import { secureHeaders, corsPolicy, rateLimiter } from './middleware/security.ts';

import authRouter from './routes/auth.ts';
import farmersRouter from './routes/farmers.ts';
import buyersRouter from './routes/buyers.ts';
import produceRouter from './routes/produce.ts';
import marketPricesRouter from './routes/marketPrices.ts';
import bidsRouter from './routes/bids.ts';
import transactionsRouter from './routes/transactions.ts';
import aiRouter from './routes/ai.ts';
import adminRouter from './routes/admin.ts';
import notificationsRouter from './routes/notifications.ts';
import innovationsRouter from './routes/innovations.ts';

export function createExpressApp() {
  const app = express();

  // 1. Security Headers
  app.use(secureHeaders);

  // 2. CORS Policy
  app.use(corsPolicy);

  // 3. Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 4. Rate Limiting: General API rate limiting (300 req / 15 min)
  app.use('/api', rateLimiter(15 * 60 * 1000, 300));

  // 5. Rate Limiting: Authentication endpoints (30 req / 15 min)
  app.use('/api/auth', rateLimiter(15 * 60 * 1000, 30));

  // 6. Structured Request Logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (!req.path.startsWith('/@') && !req.path.includes('.vite') && !req.path.includes('node_modules')) {
        logger.info(`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // 7. Global Authentication Identification
  app.use(authenticate);

  // 8. API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/farmers', farmersRouter);
  app.use('/api/buyers', buyersRouter);
  app.use('/api/produce', produceRouter);
  app.use('/api/crops', (_req, res, next) => {
    _req.url = '/crops';
    produceRouter(_req, res, next);
  });
  app.use('/api/market-prices', marketPricesRouter);
  app.use('/api/bids', bidsRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api', innovationsRouter);

  // Health route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'FarmGrade Secure Trading API',
      timestamp: new Date().toISOString(),
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
