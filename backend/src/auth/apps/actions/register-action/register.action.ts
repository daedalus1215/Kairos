import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/domain/services/auth.service';
import { RegisterDto } from 'src/auth/apps/dtos/requests/register.dto';
import { AuthResponseDto } from 'src/auth/apps/dtos/responses/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class RegisterAction {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  apply(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }
}
