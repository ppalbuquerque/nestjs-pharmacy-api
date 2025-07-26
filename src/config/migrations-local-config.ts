import { DataSource } from 'typeorm';

import { Medication } from '../medication/medication.entitity';

export default new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'pharma',
  entities: [Medication],
  migrations: ['src/db/migrations/*{.ts,.js}'],
  synchronize: true,
});
