import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from 'src/users/infra/repositories/user.repository';
import { RegisterDto } from 'src/auth/apps/dtos/requests/register.dto';
import { User } from 'src/users/domain/entities/user.entity';

@Injectable()
export class RegisterTransactionScript {
  constructor(private readonly userRepository: UserRepository) {}

  apply = async (dto: RegisterDto): Promise<User> => {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.userRepository.create({
      email: dto.email,
      passwordHash,
      defaultHourlyRate: dto.defaultHourlyRate ?? 100.0,
    });
  };
}
