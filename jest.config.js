const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/jest.setup.next.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.spec.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/e2e/**',
    '!**/types/**',
    '!app/**/layout.tsx',
    '!app/**/page.tsx',
    '!app/**/error.tsx',
    '!app/**/loading.tsx',
    '!app/**/not-found.tsx',
    '!app/**/global-error.tsx',
    '!lib/monitoring/**',
    '!lib/i18n/**',
    '!lib/ai/**',
    '!lib/audit/**',
    '!lib/supabase/**',
    '!lib/curriculum/**',
    '!jest.config.js',
    '!next.config.mjs',
    '!tailwind.config.js',
    '!postcss.config.js',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)