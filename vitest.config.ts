/// <reference types="vitest" />
// Suppress IDE/TS errors if devDependencies aren't installed yet in the environment.
// The import is valid when `vitest` is installed as a devDependency.
// @ts-ignore
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'test/setupTests.ts',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
