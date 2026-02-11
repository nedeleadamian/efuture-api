import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthConfigService } from './auth-config.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { CoreAuthService } from './core-auth.service';

const Strategies = [JwtStrategy, JwtRefreshStrategy];

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useClass: AuthConfigService,
    }),
  ],
  providers: [
    JwtStrategy,
    CoreAuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ...Strategies,
  ],
  exports: [JwtModule, PassportModule, CoreAuthService],
})
export class CoreAuthModule {}
