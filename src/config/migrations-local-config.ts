import { DataSource } from 'typeorm';

import { Medication } from '../medication/medication.entitity';
import { File } from '../files/entities/file.entity';

export default new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'pharma',
  entities: [Medication, File],
  migrations: ['src/db/migrations/*{.ts,.js}'],
  synchronize: true,
});
