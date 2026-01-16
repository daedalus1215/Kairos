import { IsEmail, IsString, MinLength, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 150.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultHourlyRate?: number;
}
