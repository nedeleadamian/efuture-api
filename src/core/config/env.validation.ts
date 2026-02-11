import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import { Environment } from '../../common/enums/environment.enum';


class EnvironmentVariables {

  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;


  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;



  @IsString()
  JWT_SECRET_KEY: string;

  @IsString()
  JWT_EXPIRATION: string;

  @IsString()
  JWT_REFRESH_EXPIRATION: string;


  @IsOptional()
  @IsString()
  CORS_ALLOWED_ORIGINS?: string;

  @IsOptional()
  @IsString()
  CORS_ALLOWED_ORIGINS_HTTP?: string;

  @IsOptional()
  @IsString()
  CORS_ALLOWED_ORIGINS_WS?: string;

  @IsOptional()
  @IsString()
  CORS_ALLOWED_HEADERS?: string;

  @IsOptional()
  @IsString()
  CORS_EXPOSED_HEADERS?: string;

  @IsOptional()
  @IsNumber()
  CORS_MAX_AGE?: number;


  @IsNumber()
  THROTTLER_TTL: number;

  @IsNumber()
  THROTTLER_LIMIT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
