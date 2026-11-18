// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'off',
    // Run in a non-Kazakhstan zone on purpose: dates must still follow Asia/Almaty.
    timezoneId: 'UTC',
    locale: 'kk-KZ'
  },
  projects: [
    { name: 'desktop-1440', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-375', use: { browserName: 'chromium', viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } }
  ],
  webServer: {
    command: 'node tests/serve.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI
  }
});
