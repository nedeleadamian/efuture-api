import { Injectable } from '@nestjs/common';
import { SignUpCommand } from './commands/sign-up.command';
import { SignInCommand } from './commands/sign-in.command';
import { RefreshTokensCommand } from './commands/refresh-tokens.command';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { LogoutCommand } from './commands/logout.command';

@Injectable()
export class AuthService {
  constructor(
    private readonly signUpCmd: SignUpCommand,
    private readonly signInCmd: SignInCommand,
    private readonly refreshTokensCmd: RefreshTokensCommand,
    private readonly logoutCmd: LogoutCommand,
  ) {}

  signUp(signUpDto: SignUpDto) {
    return this.signUpCmd.execute(signUpDto);
  }

  signIn(signInDto: SignInDto) {
    return this.signInCmd.execute(signInDto);
  }

  refreshTokens(userId: string, refreshToken: string) {
    return this.refreshTokensCmd.execute(userId, refreshToken);
  }

  logout(userId: string) {
    return this.logoutCmd.execute(userId);
  }
}
