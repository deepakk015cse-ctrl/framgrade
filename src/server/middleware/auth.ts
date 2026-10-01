import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../../db/index.ts';
import { users } from '../../db/schema.ts';
import { eq, or } from 'drizzle-orm';
import { logger } from '../logger.ts';
import { verifyToken } from '../lib/authSecurity.ts';

export interface AuthenticatedUser {
  id: number;
  uid: string | null;
  name: string;
  phone: string;
  email: string | null;
  role: 'farmer' | 'buyer' | 'kiosk_operator' | 'admin' | string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const customUserId = req.headers['x-user-id'] as string | undefined;

  try {
    // 1. Check Bearer Token if present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1].trim();

      // Case A: FarmGrade HMAC signed session token
      if (token.startsWith('fg_')) {
        const decoded = verifyToken(token);
        if (decoded) {
          try {
            const found = await db
              .select()
              .from(users)
              .where(eq(users.id, decoded.userId))
              .limit(1);

            if (found.length > 0) {
              req.user = found[0];
              return next();
            }
          } catch {
            // DB offline fallback uses signed token payload
          }

          req.user = {
            id: decoded.userId,
            uid: `usr_${decoded.userId}`,
            name: decoded.name,
            phone: decoded.phone,
            email: null,
            role: decoded.role,
          };
          return next();
        }
      }

      // Case B: Real Firebase ID Token
      if (token && !token.startsWith('demo-') && !token.startsWith('fg_') && token.length > 50) {
        try {
          const decodedToken = await adminAuth.verifyIdToken(token);
          const found = await db
            .select()
            .from(users)
            .where(eq(users.uid, decodedToken.uid))
            .limit(1);

          if (found.length > 0) {
            req.user = found[0];
            return next();
          }

          // If new Firebase user, automatically create user record
          const [newUser] = await db
            .insert(users)
            .values({
              uid: decodedToken.uid,
              name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
              phone: decodedToken.phone_number || '0000000000',
              email: decodedToken.email || null,
              role: 'farmer',
            })
            .returning();

          req.user = newUser;
          return next();
        } catch (tokenErr) {
          logger.warn('Firebase token verification error', { error: String(tokenErr) });
        }
      }

      // Case C: Quick Demo tokens (e.g. demo-farmer, demo-buyer, demo-admin, demo-1)
      if (token.startsWith('demo-')) {
        const identifier = token.replace('demo-', '');
        const numId = parseInt(identifier, 10);

        try {
          const condition = !isNaN(numId)
            ? eq(users.id, numId)
            : or(eq(users.role, identifier), eq(users.uid, identifier));

          const found = await db
            .select()
            .from(users)
            .where(condition)
            .limit(1);

          if (found.length > 0) {
            req.user = found[0];
            return next();
          }
        } catch {
          // DB offline fallback
        }

        const fallbackRole = identifier.includes('buyer')
          ? 'buyer'
          : identifier.includes('admin')
          ? 'admin'
          : 'farmer';
        req.user = {
          id: fallbackRole === 'buyer' ? 2 : fallbackRole === 'admin' ? 3 : 1,
          uid: `usr_${fallbackRole}`,
          name:
            fallbackRole === 'buyer'
              ? 'Ramesh Kumar'
              : fallbackRole === 'admin'
              ? 'Admin'
              : 'Murugan Selvam',
          phone:
            fallbackRole === 'buyer'
              ? '9443210987'
              : fallbackRole === 'admin'
              ? '9999900001'
              : '9842177312',
          email:
            fallbackRole === 'buyer'
              ? 'ramesh@farmgrade.in'
              : fallbackRole === 'admin'
              ? 'admin@farmgrade.in'
              : 'murugan@farmgrade.in',
          role: fallbackRole,
        };
        return next();
      }
    }

    // 2. Custom header identification for local dev
    if (customUserId) {
      const numId = parseInt(customUserId, 10);
      const condition = !isNaN(numId)
        ? or(eq(users.id, numId), eq(users.uid, customUserId))
        : eq(users.uid, customUserId);

      const found = await db.select().from(users).where(condition).limit(1);
      if (found.length > 0) {
        req.user = found[0];
        return next();
      }
    }

    next();
  } catch (error) {
    logger.error('Authentication error:', { error: String(error) });
    next();
  }
};

/**
 * Strict authentication guard middleware
 */
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication credentials required. Please sign in.',
    });
  }
  next();
};

/**
 * Strict role-based authorization guard middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Please sign in to access this resource.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted. Required role: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};
