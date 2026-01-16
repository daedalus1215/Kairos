import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from 'src/users/infra/repositories/user.repository';
import { LoginDto } from 'src/auth/apps/dtos/requests/login.dto';
import { User } from 'src/users/domain/entities/user.entity';

@Injectable()
export class LoginTransactionScript {
  constructor(private readonly userRepository: UserRepository) {}

  apply = async (dto: LoginDto): Promise<User> => {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  };
}
