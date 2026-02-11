import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ThrottlerConfig } from '@core/config/configs/throttler.config';
import { validate } from './env.validation';
import { AuthConfig } from './configs/auth.config';
import { TypeOrmConfig } from './configs/type-orm.config';
import { BaseConfig } from './configs/base.config';
import { CorsConfig } from './configs/cors.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [AuthConfig, TypeOrmConfig, BaseConfig, CorsConfig, ThrottlerConfig],
    }),
  ],
})
export class CoreConfigModule {}
