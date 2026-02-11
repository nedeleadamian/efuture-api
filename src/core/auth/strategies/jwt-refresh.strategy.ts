import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { ConfigType } from '@nestjs/config';
import { REFRESH_TOKEN_COOKIE } from '@core/auth/auth.constants';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthConfig } from '../../config/configs/auth.config';
import { ActiveUserDataWithRefreshToken } from '../interfaces/active-user-data.interface';
import { InvalidTokenException } from '../../../auth/exceptions/invalid-token.exception';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(AuthConfig.KEY)
    authConfig: ConfigType<typeof AuthConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.[REFRESH_TOKEN_COOKIE],
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfig.secretKey,
      algorithms: ['HS256'],
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<ActiveUserDataWithRefreshToken> {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new InvalidTokenException();
    }

    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
