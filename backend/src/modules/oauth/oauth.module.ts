import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { ClientStore } from '../../infra/client.store';
import { AuthorizationCodeStore } from '../../infra/authorization-code.store';
import { RefreshTokenStore } from '../../infra/refresh-token.store';

@Module({
  controllers: [OAuthController],
  providers: [
    OAuthService,
    ClientStore,
    AuthorizationCodeStore,
    RefreshTokenStore,
  ],
  exports: [OAuthService, ClientStore, AuthorizationCodeStore, RefreshTokenStore],
})
export class OAuthModule {}
