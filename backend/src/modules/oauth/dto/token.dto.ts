import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsNotEmpty({ message: 'grant_type is required' })
  @IsIn(['authorization_code', 'refresh_token'], {
    message: 'grant_type must be "authorization_code" or "refresh_token"',
  })
  grant_type: string;

  @IsString()
  @IsNotEmpty({ message: 'client_id is required' })
  client_id: string;

  // Required for authorization_code grant
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  redirect_uri?: string;

  @IsString()
  @IsOptional()
  code_verifier?: string;

  // Required for refresh_token grant
  @IsString()
  @IsOptional()
  refresh_token?: string;
}
