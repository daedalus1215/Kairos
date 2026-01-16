import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/shared-kernel/apps/decorators/current-user.decorator';
import { UserRepository } from 'src/users/infra/repositories/user.repository';

@ApiTags('Auth')
@Controller('auth')
export class MeAction {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  async apply(@CurrentUser() user: CurrentUserPayload) {
    const fullUser = await this.userRepository.findById(user.userId);
    return {
      id: fullUser?.id,
      email: fullUser?.email,
      defaultHourlyRate: Number(fullUser?.defaultHourlyRate),
    };
  }
}
