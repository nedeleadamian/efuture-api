import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { BaseConfig } from '@core/config/configs/base.config';
import { CorsConfig } from '@core/config/configs/cors.config';
import { HttpExceptionFilter } from '@common/filters/exceptions.filter';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { setupSwagger } from '@common/swagger/swagger.config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const baseConfig = app.get<ConfigType<typeof BaseConfig>>(BaseConfig.KEY);
  const corsConfig = app.get<ConfigType<typeof CorsConfig>>(CorsConfig.KEY);

  app.use(cookieParser());

  app.use(helmet());

  app.enableCors({
    origin: corsConfig.httpOrigins,
    credentials: true,
    allowedHeaders: corsConfig.allowedHeaders,
    exposedHeaders: corsConfig.exposedHeaders,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix(baseConfig.apiPrefix);

  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());


  if (!baseConfig.isProduction) {
    setupSwagger(app);
  }

  await app.listen(baseConfig.port);
}

bootstrap();
