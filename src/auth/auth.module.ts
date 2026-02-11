import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../user/entities/role.entity';
import { UserEntity } from '../user/entities/user.entity';
import { SignInCommand } from './commands/sign-in.command';
import { SignUpCommand } from './commands/sign-up.command';
import { RefreshTokensCommand } from './commands/refresh-tokens.command';
import { LogoutCommand } from './commands/logout.command';
import { AuthService } from './auth.service';
import {AuthController} from "./auth.controller";

const Commands = [SignInCommand, SignUpCommand, RefreshTokensCommand, LogoutCommand];

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, UserEntity])],
  controllers: [
    AuthController
  ],
  providers: [AuthService, ...Commands],
  exports: [AuthService],
})
export class AuthModule {}
