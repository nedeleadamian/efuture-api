import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { ThrottlerOptionsFactory, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ThrottlerConfig } from '@core/config/configs/throttler.config';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(
    @Inject(ThrottlerConfig.KEY)
    private readonly throttlerConfig: ConfigType<typeof ThrottlerConfig>) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    return [
      {
        ttl: this.throttlerConfig.ttl,
        limit: this.throttlerConfig.limit,
      },
    ];
  }
}
