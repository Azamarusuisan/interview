import '@testing-library/jest-dom'

// Mock IndexedDB for tests
global.indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
} as any

// Mock fetch for API tests
global.fetch = vi.fn()

// Setup cleanup
afterEach(() => {
  vi.clearAllMocks()
})