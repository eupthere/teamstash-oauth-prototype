import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Session,
  Redirect,
  BadRequestException,
} from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { AuthorizeQueryDto } from './dto/authorize-query.dto';
import { TokenDto } from './dto/token.dto';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * GET /oauth/authorize
   *
   * Authorization endpoint for OAuth 2.0 Authorization Code Flow with PKCE.
   * Requires user to be logged in via web session.
   *
   * Query parameters:
   * - client_id: Client application identifier
   * - redirect_uri: Where to send the authorization code
   * - response_type: Must be "code"
   * - state: CSRF protection token
   * - code_challenge: PKCE challenge
   * - code_challenge_method: Must be "S256"
   */
  @Get('authorize')
  @UseGuards(SessionAuthGuard)
  @Redirect()
  authorize(
    @Query() query: AuthorizeQueryDto,
    @Session() session: Record<string, any>,
  ) {
    const userId = session.userId as string;

    // Create authorization code
    const code = this.oauthService.createAuthorizationCode(
      query.client_id,
      query.redirect_uri,
      query.code_challenge,
      query.code_challenge_method,
      userId,
    );

    // Redirect back to client with authorization code and state
    const redirectUrl = new URL(query.redirect_uri);
    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('state', query.state);

    return {
      url: redirectUrl.toString(),
      statusCode: HttpStatus.FOUND,
    };
  }

  /**
   * POST /oauth/token
   *
   * Token endpoint for exchanging authorization code for tokens
   * or refreshing access tokens.
   *
   * Supports two grant types:
   * - authorization_code: Exchange code for access + refresh tokens
   * - refresh_token: Exchange refresh token for new access token
   */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  token(@Body() tokenDto: TokenDto) {
    if (tokenDto.grant_type === 'authorization_code') {
      // Validate required parameters for authorization_code grant
      if (!tokenDto.code || !tokenDto.redirect_uri || !tokenDto.code_verifier) {
        throw new BadRequestException(
          'code, redirect_uri, and code_verifier are required for authorization_code grant',
        );
      }

      return this.oauthService.exchangeAuthorizationCode(
        tokenDto.code,
        tokenDto.client_id,
        tokenDto.redirect_uri,
        tokenDto.code_verifier,
      );
    } else if (tokenDto.grant_type === 'refresh_token') {
      // Validate required parameters for refresh_token grant
      if (!tokenDto.refresh_token) {
        throw new BadRequestException(
          'refresh_token is required for refresh_token grant',
        );
      }

      return this.oauthService.refreshAccessToken(
        tokenDto.refresh_token,
        tokenDto.client_id,
      );
    }

    throw new BadRequestException('Invalid grant_type');
  }
}
