import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'farmgrade-super-secure-production-secret-key-2026';
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface TokenPayload {
  userId: number;
  role: 'farmer' | 'buyer' | 'kiosk_operator' | 'admin';
  name: string;
  phone: string;
  exp: number;
  iat: number;
}

/**
 * Securely hashes a plaintext password using PBKDF2 with unique cryptographic salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Validates a plaintext password against a stored salt:hash string.
 */
export function verifyPassword(password: string, storedHashWithSalt: string): boolean {
  if (!storedHashWithSalt || !storedHashWithSalt.includes(':')) {
    return false;
  }
  const [salt, originalHash] = storedHashWithSalt.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
}

/**
 * Generates a signed tamper-proof token using HMAC-SHA256.
 */
export function signToken(payload: { userId: number; role: 'farmer' | 'buyer' | 'kiosk_operator' | 'admin'; name: string; phone: string }): string {
  const now = Date.now();
  const tokenPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY_MS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `fg_${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes a signed token. Returns null if expired, malformed, or tampered.
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!token) return null;

  // Handle standard FarmGrade signed token
  if (token.startsWith('fg_')) {
    const raw = token.slice(3);
    const parts = raw.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, providedSig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (
      providedSig.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig))
    ) {
      return null;
    }

    try {
      const decodedJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
      const payload: TokenPayload = JSON.parse(decodedJson);

      // Verify expiration
      if (Date.now() > payload.exp) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  return null;
}
