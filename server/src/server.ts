import { createApp } from './app.js';
import { env } from './config/env.js';
import { AppDataSource } from './database/data-source.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function bootstrap() {
  await AppDataSource.initialize();

  const server = createApp().listen(env.PORT, () => {
    console.log(`API is running on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    console.log(`${signal} received, shutting down…`);
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();

    server.close(async () => {
      await AppDataSource.destroy();
      process.exit(0);
    });
    server.closeIdleConnections();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start the server', error);
  process.exit(1);
});
