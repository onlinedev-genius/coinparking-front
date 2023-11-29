import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Specify the file extensions for the test files
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  // Specify the pattern for the test files
  testMatch: ['**/__tests__/**/*.[t]s?(x)', '**/?(*.)+(spec|test).[t]s?(x)'],
  // Specify the directories or files to ignore for testing
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  // Specify the name mapping for the modules (if necessary)
  moduleNameMapper: {
    // Example: Mapping for CSS Modules
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  // Settings for generating the coverage report (if necessary)
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{ts,tsx}'],
  coverageReporters: ['text', 'lcov'],
};

export default config;
