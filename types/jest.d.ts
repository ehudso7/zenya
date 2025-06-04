/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom'

declare global {
  namespace NodeJS {
    interface Global {
      fetch: jest.Mock
    }
  }
}

export {}