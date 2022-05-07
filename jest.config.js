module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  bail: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
  collectCoverageFrom: ['<rootDir>/index.ts'],
  verbose: true,
  testMatch: ['<rootDir>/index.test.ts'],
};
