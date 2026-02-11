import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const AuthConfig = registerAs('auth', () => ({
  secretKey: String(process.env.JWT_SECRET_KEY),
  expiresIn: process.env.JWT_EXPIRATION as NonNullable<
    JwtModuleOptions['signOptions']
  >['expiresIn'],
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION as NonNullable<
    JwtModuleOptions['signOptions']
  >['expiresIn'],
}));
