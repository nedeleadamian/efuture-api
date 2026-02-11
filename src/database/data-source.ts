import { CustomNamingStrategy } from '@core/type-orm/naming.strategy';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/database/migrations/**/*.js'],
  synchronize: false,
  namingStrategy: new CustomNamingStrategy(),
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
