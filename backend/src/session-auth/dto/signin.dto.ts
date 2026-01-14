import { IsEmail, IsNotEmpty } from 'class-validator';

export class SigninDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
