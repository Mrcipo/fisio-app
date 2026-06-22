import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  cacheDirectory: "<rootDir>/.jest-cache",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
};

export default config;
