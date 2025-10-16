import { DataSource } from 'typeorm';

import { Medication } from '../medication/medication.entitity';
import { File } from '../files/entities/file.entity';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT') || ''),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASS'),
  database: configService.get<string>('DB_NAME'),
  entities: [Medication, File],
  migrations: ['src/db/migrations/*{.ts,.js}'],
  synchronize: true,
  ssl: true,
});
