import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionAuthModule } from './session-auth/session-auth.module';
import { OAuthModule } from './modules/oauth/oauth.module';

@Module({
  imports: [SessionAuthModule, OAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
