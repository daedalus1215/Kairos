import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/domain/services/auth.service';
import { LoginDto } from 'src/auth/apps/dtos/requests/login.dto';
import { AuthResponseDto } from 'src/auth/apps/dtos/responses/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class LoginAction {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  apply(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }
}
