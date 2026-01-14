import { Module } from '@nestjs/common';
import { SessionAuthController } from './session-auth.controller';
import { UserStore } from '../stores/user.store';

@Module({
  controllers: [SessionAuthController],
  providers: [UserStore],
  exports: [UserStore], // Export UserStore for other modules to use
})
export class SessionAuthModule {}
