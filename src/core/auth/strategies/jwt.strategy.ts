import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { ConfigType } from '@nestjs/config';
import { ACCESS_TOKEN_COOKIE } from '@core/auth/auth.constants';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthConfig } from '../../config/configs/auth.config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AuthConfig.KEY)
    authConfig: ConfigType<typeof AuthConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.[ACCESS_TOKEN_COOKIE],
      ]),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: authConfig.secretKey,
    });
  }

  async validate(payload: JwtPayload): Promise<ActiveUserData> {
    return { userId: payload.sub, email: payload.email };
  }
}
