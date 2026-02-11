import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Injectable()
export class LogoutCommand {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      {
        refreshToken: null,
      },
    );
  }
}
