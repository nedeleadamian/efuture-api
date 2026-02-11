
import { registerAs } from '@nestjs/config';
import { hasWildcard, parseCommaList } from '../../../common/utils/env.utils';

const DEFAULT_DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const DEFAULT_ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'];
const DEFAULT_EXPOSED_HEADERS = ['Content-Disposition'];

export const CorsConfig = registerAs('cors-config', () => {
  const isDev = process.env.NODE_ENV === 'development';


  const rawHttpOrigins = process.env.CORS_ALLOWED_ORIGINS_HTTP ?? process.env.CORS_ALLOWED_ORIGINS;
  const rawWsOrigins = process.env.CORS_ALLOWED_ORIGINS_WS ?? process.env.CORS_ALLOWED_ORIGINS;


  const httpOriginsList = parseCommaList(rawHttpOrigins);
  const wsOriginsList = parseCommaList(rawWsOrigins);
  const allOriginsToCheck = [...httpOriginsList, ...wsOriginsList];


  if (!isDev) {
    if (hasWildcard(allOriginsToCheck)) {
      throw new Error('Wildcard CORS origins are not permitted outside development.');
    }
    if (httpOriginsList.length === 0) {
      throw new Error(
        'CORS_ALLOWED_ORIGINS_HTTP must list at least one allowed origin outside development.',
      );
    }
  }


  const httpOrigins = httpOriginsList.length ? httpOriginsList : isDev ? DEFAULT_DEV_ORIGINS : [];
  const wsOrigins = wsOriginsList.length ? wsOriginsList : isDev ? DEFAULT_DEV_ORIGINS : [];

  const allowedHeaders = parseCommaList(process.env.CORS_ALLOWED_HEADERS);
  const exposedHeaders = parseCommaList(process.env.CORS_EXPOSED_HEADERS);
  const maxAge = Number(process.env.CORS_MAX_AGE ?? 86_400);

  return {
    httpOrigins,
    wsOrigins,
    allowedHeaders: allowedHeaders.length ? allowedHeaders : DEFAULT_ALLOWED_HEADERS,
    exposedHeaders: exposedHeaders.length ? exposedHeaders : DEFAULT_EXPOSED_HEADERS,
    maxAge: Number.isNaN(maxAge) ? 86_400 : maxAge,
  };
});
