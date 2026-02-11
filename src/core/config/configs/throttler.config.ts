import { registerAs } from '@nestjs/config';

export const ThrottlerConfig = registerAs('throttler', () => ({
  ttl: Number(process.env.THROTTLER_TTL),
  limit: Number(process.env.THROTTLER_LIMIT),
}));