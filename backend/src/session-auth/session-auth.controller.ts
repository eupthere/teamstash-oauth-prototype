import {
  Controller,
  Post,
  Body,
  ConflictException,
  HttpCode,
  HttpStatus,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UserStore } from '../stores/user.store';
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

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() signinDto: SigninDto,
    @Session() session: Record<string, any>,
  ) {
    const { email, password } = signinDto;

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
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}
