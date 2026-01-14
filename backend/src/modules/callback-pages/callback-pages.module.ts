import { Module } from '@nestjs/common';
import { CallbackPagesController } from './callback-pages.controller';

@Module({
  controllers: [CallbackPagesController],
})
export class CallbackPagesModule {}
