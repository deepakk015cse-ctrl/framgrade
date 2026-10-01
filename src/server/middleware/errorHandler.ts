import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger.ts';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error(`API Error: ${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    stack: isProd ? undefined : err.stack,
    details: err.details,
  });

  // Sanitize internal database error messages
  let clientMessage = err.message || 'Internal Server Error';
  if (statusCode === 500 && (clientMessage.includes('password') || clientMessage.includes('connect ECONNREFUSED'))) {
    clientMessage = 'Database service temporarily unavailable. Please try again.';
  }

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
    ...(err.details ? { details: err.details } : {}),
  });
};
