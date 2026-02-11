import { Module } from '@nestjs/common';
import { CoreThrottlerModule } from '@core/throttler/core-throttler.module';
import { CoreConfigModule } from './config/core-config.module';
import { CoreTypeOrmModule } from './type-orm/core-type-orm.module';
import { CoreAuthModule } from './auth/core-auth.module';

const Modules = [CoreConfigModule, CoreTypeOrmModule, CoreAuthModule, CoreThrottlerModule];

@Module({
  imports: [...Modules],
  exports: [...Modules],
})
export class CoreModule {}
