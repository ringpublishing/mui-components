import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.E2E_BASE_URL || 'https://design.ringpublishing.com';
const AUTH_FILE = path.resolve('playwright', '.auth', 'user.json');

/**
 * Playwright configuration for WCAG accessibility testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['html', { open: 'on-failure' }]],
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /variant\.setup\.ts/,
        },
        {
            name: 'desktop-chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: AUTH_FILE,
            },
            dependencies: ['setup'],
        },
        {
            name: 'mobile-chromium',
            use: {
                ...devices['Pixel 5'],
                storageState: AUTH_FILE,
            },
            dependencies: ['setup'],
        },
    ],
});
