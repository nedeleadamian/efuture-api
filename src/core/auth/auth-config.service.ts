import { Injectable, Inject } from '@nestjs/common';
import { JwtOptionsFactory, JwtModuleOptions } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { AuthConfig } from '../config/configs/auth.config';

@Injectable()
export class AuthConfigService implements JwtOptionsFactory {
  constructor(
    @Inject(AuthConfig.KEY)
    private readonly authConfig: ConfigType<typeof AuthConfig>,
  ) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.authConfig.secretKey,
      signOptions: {
        algorithm: 'HS256',
        expiresIn: this.authConfig.expiresIn,
      },
      verifyOptions: {
        algorithms: ['HS256'],
      },
    };
  }
}
