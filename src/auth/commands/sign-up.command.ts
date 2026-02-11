import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SignUpDto } from '../dto/sign-up.dto';
import { ActiveUserData } from '../../core/auth/interfaces/active-user-data.interface';
import { UserEntity } from '../../user/entities/user.entity';
import { RoleEntity } from '../../user/entities/role.entity';
import { CoreAuthService } from '../../core/auth/core-auth.service';
import { UserRole } from '../../user/enums/user-role.enum';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';
import { RoleNotFoundException } from '../../user/exceptions/role-not-found.exception';

@Injectable()
export class SignUpCommand {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly coreAuthService: CoreAuthService,
  ) {}

  async execute(signUpDto: SignUpDto) {

    const existingUser = await this.userRepository.exists({
      where: { email: signUpDto.email },
    });

    if (existingUser) {
      throw new EmailAlreadyInUseException();
    }


    const hashedPassword = await this.coreAuthService.hashData(signUpDto.password);




    const defaultRole = await this.roleRepository.findOne({
      where: { name: UserRole.User },
      select: ['id'],
    });

    if (!defaultRole) {
      throw new RoleNotFoundException();
    }

    const newUser = this.userRepository.create({
      ...signUpDto,
      password: hashedPassword,
      roleId: defaultRole.id,
    });

    await this.userRepository.save(newUser);


    const tokens = await this.coreAuthService.generateTokens({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role?.name,
    } as ActiveUserData);


    const refreshToken = await this.coreAuthService.hashData(tokens.refreshToken);
    await this.userRepository.update(newUser.id, { refreshToken });

    return tokens;
  }
}
