import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: '.env' });

export default new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE || './db.sqlite',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
