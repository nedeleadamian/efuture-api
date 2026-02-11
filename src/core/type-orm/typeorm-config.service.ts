import { Injectable, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { CustomNamingStrategy } from '@core/type-orm/naming.strategy';
import path from 'node:path';
import { TypeOrmConfig } from '../config/configs/type-orm.config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(TypeOrmConfig.KEY)
    private readonly typeOrmConfig: ConfigType<typeof TypeOrmConfig>,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.typeOrmConfig.host,
      port: this.typeOrmConfig.port,
      username: this.typeOrmConfig.username,
      password: this.typeOrmConfig.password,
      database: this.typeOrmConfig.name,
      synchronize: false,
      dropSchema: false,
      logging: ['error'],
      entities: [path.join(__dirname, '../../**/*.entity{.ts,.js}')],
      namingStrategy: new CustomNamingStrategy(),
    };
  }
}
