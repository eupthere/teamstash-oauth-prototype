import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
const ACCESS_TOKEN_EXPIRATION = '15m'; // 15 minutes

export interface JWTPayload {
  sub: string; // user ID
  clientId: string;
  iat?: number;
  exp?: number;
}

export function signAccessToken(userId: string, clientId: string): string {
  const payload: JWTPayload = {
    sub: userId,
    clientId,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch (error) {
    return null;
  }
}
