// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,             // Allows using 'describe', 'it', 'expect' without importing them
    environment: 'jsdom',      // Simulates a browser environment
    setupFiles: './src/setupTests.js', // Runs setup before each test
  },
});