import {
  Controller,
  Post,
  Body,
  ConflictException,
  HttpCode,
  HttpStatus,
  Session,
  UnauthorizedException,
  InternalServerErrorException,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserStore } from '../stores/user.store';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller()
export class SessionAuthController {
  constructor(private readonly userStore: UserStore) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() signupDto: SignupDto,
    @Session() session: Record<string, any>,
  ) {
    const { email, password } = signupDto;

    // Check if user already exists
    if (this.userStore.emailExists(email)) {
      throw new ConflictException('Email already registered');
    }

    // Hash the password with bcrypt (salt rounds: 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with UUID
    const user = this.userStore.createUser(email, passwordHash);

    // Establish session for the user
    session.userId = user.id;
    session.email = user.email;

    // Return user info (without password hash)
    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Session() session: Record<string, any>,
  ) {
    const { email, password } = loginDto;

    // Find user by email
    const user = this.userStore.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Establish session for the user
    session.userId = user.id;
    session.email = user.email;

    // Return user info (without password hash)
    return {
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  async logout(
    @Session() session: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
  ) {
    return new Promise((resolve, reject) => {
      session.destroy((err: Error) => {
        if (err) {
          reject(
            new InternalServerErrorException('Failed to logout. Please try again.'),
          );
        } else {
          // Clear the session cookie
          res.clearCookie('connect.sid', {
            httpOnly: true,
            sameSite: 'lax',
          });

          resolve({ message: 'Logged out successfully' });
        }
      });
    });
  }
}
