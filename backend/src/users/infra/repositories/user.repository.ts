import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/domain/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findById = async (id: number): Promise<User | null> => {
    return this.repository.findOne({ where: { id } });
  };

  findByEmail = async (email: string): Promise<User | null> => {
    return this.repository.findOne({ where: { email } });
  };

  create = async (data: Partial<User>): Promise<User> => {
    const user = this.repository.create(data);
    return this.repository.save(user);
  };

  update = async (id: number, data: Partial<User>): Promise<User | null> => {
    await this.repository.update(id, data);
    return this.findById(id);
  };
}
