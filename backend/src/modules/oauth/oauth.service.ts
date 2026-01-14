import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientStore } from '../../infra/client.store';
import { AuthorizationCodeStore } from '../../infra/authorization-code.store';
import { RefreshTokenStore } from '../../infra/refresh-token.store';
import { signAccessToken } from '../../common/utils/jwt.utils';
import { verifyPKCE } from '../../common/utils/pkce.utils';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

@Injectable()
export class OAuthService {
  constructor(
    private readonly clientStore: ClientStore,
    private readonly authorizationCodeStore: AuthorizationCodeStore,
    private readonly refreshTokenStore: RefreshTokenStore,
  ) {}

  /**
   * Create an authorization code after validating the authorization request
   */
  createAuthorizationCode(
    clientId: string,
    redirectUri: string,
    codeChallenge: string,
    codeChallengeMethod: string,
    userId: string,
  ): string {
    // Validate client exists
    const client = this.clientStore.getClient(clientId);
    if (!client) {
      throw new BadRequestException('Invalid client_id');
    }

    // Validate redirect_uri
    if (!this.clientStore.validateRedirectUri(clientId, redirectUri)) {
      throw new BadRequestException('Invalid redirect_uri');
    }

    // Validate PKCE method
    if (codeChallengeMethod !== 'S256') {
      throw new BadRequestException('code_challenge_method must be S256');
    }

    // Create authorization code
    const code = this.authorizationCodeStore.create(
      clientId,
      userId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
    );

    return code;
  }

  /**
   * Exchange authorization code for access token and refresh token
   */
  exchangeAuthorizationCode(
    code: string,
    clientId: string,
    redirectUri: string,
    codeVerifier: string,
  ): TokenResponse {
    // Validate authorization code exists and is valid
    if (!this.authorizationCodeStore.isValid(code)) {
      throw new UnauthorizedException('Invalid or expired authorization code');
    }

    const authCode = this.authorizationCodeStore.get(code);
    if (!authCode) {
      throw new UnauthorizedException('Invalid authorization code');
    }

    // Validate client_id matches
    if (authCode.clientId !== clientId) {
      throw new UnauthorizedException('client_id mismatch');
    }

    // Validate redirect_uri matches
    if (authCode.redirectUri !== redirectUri) {
      throw new UnauthorizedException('redirect_uri mismatch');
    }

    // Verify PKCE code_verifier
    if (
      !verifyPKCE(
        codeVerifier,
        authCode.codeChallenge,
        authCode.codeChallengeMethod,
      )
    ) {
      throw new UnauthorizedException('Invalid code_verifier');
    }

    // Mark authorization code as used
    this.authorizationCodeStore.markAsUsed(code);

    // Generate access token and refresh token
    const accessToken = signAccessToken(authCode.userId, clientId);
    const refreshToken = this.refreshTokenStore.create(
      authCode.userId,
      clientId,
    );

    // Delete authorization code (single use)
    this.authorizationCodeStore.delete(code);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes in seconds
      refresh_token: refreshToken,
    };
  }

  /**
   * Exchange refresh token for new access token
   */
  refreshAccessToken(refreshToken: string, clientId: string): TokenResponse {
    // Validate refresh token exists and is valid
    if (!this.refreshTokenStore.isValid(refreshToken)) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const token = this.refreshTokenStore.get(refreshToken);
    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Validate client_id matches
    if (token.clientId !== clientId) {
      throw new UnauthorizedException('client_id mismatch');
    }

    // Generate new access token
    const accessToken = signAccessToken(token.userId, clientId);

    // Keep the same refresh token (rotate in production)
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes in seconds
      refresh_token: refreshToken,
    };
  }
}
