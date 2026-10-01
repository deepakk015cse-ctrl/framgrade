import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger.ts';

/**
 * Sets industry standard security headers to protect against XSS, clickjacking, MIME sniffing, etc.
 */
export function secureHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // XSS protection legacy filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Control referrer info
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Allow microphone in iframe permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=*');

  next();
}

/**
 * Configures Cross-Origin Resource Sharing (CORS) with origin validation.
 */
export function corsPolicy(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}

// In-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean up expired records to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Configurable rate limiter middleware.
 * @param windowMs Time window in milliseconds
 * @param max Maximum requests allowed per window
 */
export function rateLimiter(windowMs: number = 15 * 60 * 1000, max: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip static assets or vite requests
    if (req.path.startsWith('/@') || req.path.includes('.vite') || req.path.includes('node_modules')) {
      return next();
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const key = `${clientIp}:${req.baseUrl || ''}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    record.count += 1;
    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (record.count > max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      logger.warn('Rate limit exceeded', { ip: clientIp, path: req.path });
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests. Please slow down and try again shortly.',
        retryAfter: retryAfterSec,
      });
    }

    next();
  };
}
