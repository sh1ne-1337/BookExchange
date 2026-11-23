import pg from 'pg';
import { TEST_ENV } from './test-env.js';

export default async function setup() {
  Object.assign(process.env, TEST_ENV);
  const { env } = await import('../src/config/env.js');

  const adminClient = new pg.Client({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: 'postgres',
  });
  try {
    await adminClient.connect();
  } catch {
    throw new Error(
      `Cannot connect to PostgreSQL at ${env.DB_HOST}:${env.DB_PORT}. Start it with "docker compose up -d".`,
    );
  }
  const { rowCount } = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [
    env.DB_NAME,
  ]);
  if (!rowCount) await adminClient.query(`CREATE DATABASE "${env.DB_NAME}"`);
  await adminClient.end();

  const { AppDataSource } = await import('../src/database/data-source.js');
  await AppDataSource.initialize();
  await AppDataSource.dropDatabase();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();
}
