/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  cacheDirectory: "<rootDir>/.jest-cache",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  moduleNameMapper: {
    "puppeteer-core": "<rootDir>/src/test/__mocks__/puppeteer-core.js",
  },
};

module.exports = config;
