import { registerAs } from '@nestjs/config';
import { Environment } from '@common/enums/environment.enum';

export const BaseConfig =  registerAs('base', () => ({
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT || 3000),
  apiPrefix: 'api/v1',
  isProduction: process.env.NODE_ENV === Environment.Production,
}));
