import { defineConfig } from 'vitest/config';
import { TEST_ENV } from './tests/test-env.js';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: TEST_ENV,
    globalSetup: './tests/global-setup.ts',
    setupFiles: ['./tests/setup.ts'],

    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 30_000,
  },
});
