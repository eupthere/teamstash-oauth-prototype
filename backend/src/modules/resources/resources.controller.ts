import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserStore } from '../../stores/user.store';
import { JWTPayload } from '../../common/utils/jwt.utils';

interface RequestWithUser extends Request {
  user: JWTPayload;
}

@Controller('api')
export class ResourcesController {
  constructor(private readonly userStore: UserStore) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const user = this.userStore.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return user info excluding passwordHash
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  @Get('protected-resource')
  @UseGuards(JwtAuthGuard)
  getProtectedResource(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const clientId = req.user.clientId;

    // Example protected resource demonstrating OAuth token usage
    return {
      message: 'This is a protected resource',
      userId,
      clientId,
      timestamp: new Date().toISOString(),
      data: {
        example: 'This demonstrates resource access via OAuth token',
        access_granted_to: clientId,
        user_context: userId,
      },
    };
  }
}
