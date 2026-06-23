import { playwright } from '@vitest/browser-playwright'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      restoreMocks: true,
      clearMocks: true,
      css: true,
      testTimeout: 15_000,
      hookTimeout: 15_000,
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['tests/unit/**/*.spec.ts'],
            environment: 'node',
            setupFiles: ['./tests/setup/unit.ts', './tests/setup/msw.node.ts'],
          },
        },
        {
          extends: true,
          test: {
            name: 'browser',
            include: ['tests/browser/**/*.browser.spec.ts'],
            setupFiles: ['./tests/setup/browser.ts', './tests/setup/msw.browser.ts'],
            browser: {
              enabled: true,
              headless: true,
              trace: 'retain-on-failure',
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  }),
)
