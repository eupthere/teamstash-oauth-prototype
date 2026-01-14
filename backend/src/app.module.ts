import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionAuthModule } from './session-auth/session-auth.module';

@Module({
  imports: [SessionAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
