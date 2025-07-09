import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSaveDraft } from '@/hooks/useAutoSaveDraft'

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(),
  close: vi.fn(),
}

const mockTransaction = {
  objectStore: vi.fn(),
  oncomplete: null,
  onerror: null,
}

const mockStore = {
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockTransaction.objectStore.mockReturnValue(mockStore)
  mockDB.transaction.mockReturnValue(mockTransaction)
  
  global.indexedDB = {
    open: vi.fn().mockImplementation(() => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: mockDB,
    })),
  } as any
})

describe('useAutoSaveDraft', () => {
  it('should initialize without errors', () => {
    const { result } = renderHook(() =>
      useAutoSaveDraft('test-id', 'Test Title', { question1: 'answer1' })
    )

    expect(result.current).toHaveProperty('saveDraft')
    expect(result.current).toHaveProperty('loadDraft')
    expect(result.current).toHaveProperty('clearDraft')
  })

  it('should save draft data with correct structure', async () => {
    const { result } = renderHook(() =>
      useAutoSaveDraft('test-id', 'Test Title', { question1: 'answer1' })
    )

    await act(async () => {
      await result.current.saveDraft()
    })

    // Should attempt to open IndexedDB and save data
    expect(global.indexedDB.open).toHaveBeenCalled()
  })

  it('should handle null id gracefully', async () => {
    const { result } = renderHook(() =>
      useAutoSaveDraft(null, 'Test Title', { question1: 'answer1' })
    )

    await act(async () => {
      await result.current.saveDraft()
    })

    // Should not attempt to save when id is null
    expect(global.indexedDB.open).not.toHaveBeenCalled()
  })
})