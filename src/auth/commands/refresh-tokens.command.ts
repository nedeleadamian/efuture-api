import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserData } from '@core/auth/interfaces/active-user-data.interface';
import { CoreAuthService } from '@core/auth/core-auth.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';

@Injectable()
export class RefreshTokensCommand {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly coreAuthService: CoreAuthService,
  ) {}

  async execute(userId: string, incomingRefreshToken: string) {


    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'refreshToken', 'roleId'],
      relations: ['role'],
    });


    if (!user || !user.refreshToken) {
      throw new InvalidTokenException();
    }


    const isTokenMatch = await this.coreAuthService.matchesHash(
      incomingRefreshToken,
      user.refreshToken,
    );

    if (!isTokenMatch) {


      throw new InvalidTokenException();
    }


    const tokens = await this.coreAuthService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role?.name,
    } as ActiveUserData);


    const newHashedToken = await this.coreAuthService.hashData(tokens.refreshToken);


    await this.userRepository.update(user.id, {
      refreshToken: newHashedToken,
    });

    return tokens;
  }
}
