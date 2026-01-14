import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class AuthorizeQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'client_id is required' })
  client_id: string;

  @IsString()
  @IsNotEmpty({ message: 'redirect_uri is required' })
  redirect_uri: string;

  @IsString()
  @IsNotEmpty({ message: 'response_type is required' })
  @IsIn(['code'], { message: 'response_type must be "code"' })
  response_type: string;

  @IsString()
  @IsNotEmpty({ message: 'state is required' })
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'code_challenge is required' })
  code_challenge: string;

  @IsString()
  @IsNotEmpty({ message: 'code_challenge_method is required' })
  @IsIn(['S256'], { message: 'code_challenge_method must be "S256"' })
  code_challenge_method: string;
}
