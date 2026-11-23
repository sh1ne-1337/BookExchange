import 'reflect-metadata';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { env } from '../config/env.js';
import { Book } from '../entities/book.entity.js';
import { ExchangeRequest } from '../entities/exchange-request.entity.js';
import { User } from '../entities/user.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [User, Book, ExchangeRequest],
  migrations: [path.join(import.meta.dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: ['error', 'warn'],
});
