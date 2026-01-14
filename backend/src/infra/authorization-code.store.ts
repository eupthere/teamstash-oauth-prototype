import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface AuthorizationCode {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  expiresAt: Date;
  used: boolean;
}

@Injectable()
export class AuthorizationCodeStore {
  private codes: Map<string, AuthorizationCode> = new Map();
  private readonly CODE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

  create(
    clientId: string,
    userId: string,
    redirectUri: string,
    codeChallenge: string,
    codeChallengeMethod: string,
  ): string {
    const code = uuidv4();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRATION_MS);

    this.codes.set(code, {
      code,
      clientId,
      userId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
      expiresAt,
      used: false,
    });

    return code;
  }

  get(code: string): AuthorizationCode | undefined {
    return this.codes.get(code);
  }

  markAsUsed(code: string): void {
    const authCode = this.codes.get(code);
    if (authCode) {
      authCode.used = true;
    }
  }

  delete(code: string): void {
    this.codes.delete(code);
  }

  isValid(code: string): boolean {
    const authCode = this.codes.get(code);
    if (!authCode) {
      return false;
    }

    if (authCode.used) {
      return false;
    }

    if (authCode.expiresAt < new Date()) {
      this.delete(code);
      return false;
    }

    return true;
  }
}
