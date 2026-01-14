import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface RefreshToken {
  token: string;
  userId: string;
  clientId: string;
  expiresAt: Date;
}

@Injectable()
export class RefreshTokenStore {
  private tokens: Map<string, RefreshToken> = new Map();
  private readonly TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  create(userId: string, clientId: string): string {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRATION_MS);

    this.tokens.set(token, {
      token,
      userId,
      clientId,
      expiresAt,
    });

    return token;
  }

  get(token: string): RefreshToken | undefined {
    return this.tokens.get(token);
  }

  delete(token: string): void {
    this.tokens.delete(token);
  }

  isValid(token: string): boolean {
    const refreshToken = this.tokens.get(token);
    if (!refreshToken) {
      return false;
    }

    if (refreshToken.expiresAt < new Date()) {
      this.delete(token);
      return false;
    }

    return true;
  }

  deleteByUserId(userId: string): void {
    for (const [token, refreshToken] of this.tokens.entries()) {
      if (refreshToken.userId === userId) {
        this.tokens.delete(token);
      }
    }
  }
}
