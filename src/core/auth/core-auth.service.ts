import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthConfig } from '../config/configs/auth.config';
import { ActiveUserData } from './interfaces/active-user-data.interface';

@Injectable()
export class CoreAuthService {
  constructor(
    @Inject(AuthConfig.KEY)
    private readonly authConfig: ConfigType<typeof AuthConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(user: ActiveUserData) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.userId, email: user.email },
        { expiresIn: this.authConfig.expiresIn },
      ),
      this.jwtService.signAsync(
        { sub: user.userId, email: user.email },
        { expiresIn: this.authConfig.refreshExpiresIn },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(data, salt);
  }

  async matchesHash(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}
