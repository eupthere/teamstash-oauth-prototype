import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionAuthModule } from './session-auth/session-auth.module';
import { OAuthModule } from './modules/oauth/oauth.module';
import { CallbackPagesModule } from './modules/callback-pages/callback-pages.module';

@Module({
  imports: [SessionAuthModule, OAuthModule, CallbackPagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
