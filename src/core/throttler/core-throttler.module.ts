import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfigService } from '@core/throttler/throttler-config.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerConfigService
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class CoreThrottlerModule {}
