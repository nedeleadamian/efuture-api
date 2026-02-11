import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserData } from '@core/auth/interfaces/active-user-data.interface';
import { CoreAuthService } from '@core/auth/core-auth.service';
import { Repository } from 'typeorm';

import { SignInDto } from '../dto/sign-in.dto';
import { UserEntity } from '../../user/entities/user.entity';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Injectable()
export class SignInCommand {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly coreAuthService: CoreAuthService,
  ) {}

  async execute(signInDto: SignInDto) {

    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },

      select: ['id', 'email', 'password', 'roleId'],
      relations: ['role'],
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordMatch = await this.coreAuthService.matchesHash(
      signInDto.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new InvalidCredentialsException();
    }


    const tokens = await this.coreAuthService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role?.name,
    } as ActiveUserData);


    const refreshToken = await this.coreAuthService.hashData(tokens.refreshToken);

    await this.userRepository.update(user.id, { refreshToken });

    return tokens;
  }
}
