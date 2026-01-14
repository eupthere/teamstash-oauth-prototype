import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller';
import { UserStore } from '../../stores/user.store';

@Module({
  controllers: [ResourcesController],
  providers: [UserStore],
})
export class ResourcesModule {}
