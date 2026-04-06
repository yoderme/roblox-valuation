import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNarrative } from './useNarrative'
import { DEFAULT_ASSUMPTIONS, runDCF } from '../lib/dcf'

const dcfResult = runDCF(DEFAULT_ASSUMPTIONS)

const mockSuccessResponse = {
  content: [{ text: 'Roblox presents a compelling risk/reward.' }],
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useNarrative', () => {
  it('initialises with empty state', () => {
    const { result } = renderHook(() => useNarrative())
    expect(result.current.narrative).toBe('')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets loading=true while the request is in flight', async () => {
    let resolveResponse
    global.fetch = vi.fn(() => new Promise(res => { resolveResponse = res }))

    const { result } = renderHook(() => useNarrative())

    act(() => {
      result.current.generate(DEFAULT_ASSUMPTIONS, dcfResult, 'bull case?')
    })

    expect(result.current.loading).toBe(true)

    // Clean up the pending promise
    await act(async () => {
      resolveResponse({
        ok: true,
        json: async () => mockSuccessResponse,
      })
    })
  })

  it('populates narrative on success and clears loading', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockSuccessResponse,
      })
    )

    const { result } = renderHook(() => useNarrative())

    await act(async () => {
      await result.current.generate(DEFAULT_ASSUMPTIONS, dcfResult, 'overview')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.narrative).toBe('Roblox presents a compelling risk/reward.')
    expect(result.current.error).toBeNull()
  })

  it('sets error on non-ok response and clears loading', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ error: { message: 'Unauthorized' } }),
      })
    )

    const { result } = renderHook(() => useNarrative())

    await act(async () => {
      await result.current.generate(DEFAULT_ASSUMPTIONS, dcfResult, 'test')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Unauthorized')
    expect(result.current.narrative).toBe('')
  })

  it('sets generic error when response has no error message', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({}),
      })
    )

    const { result } = renderHook(() => useNarrative())

    await act(async () => {
      await result.current.generate(DEFAULT_ASSUMPTIONS, dcfResult, 'test')
    })

    expect(result.current.error).toBe('API error')
  })

  it('sets error on network failure', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

    const { result } = renderHook(() => useNarrative())

    await act(async () => {
      await result.current.generate(DEFAULT_ASSUMPTIONS, dcfResult, 'test')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Network error')
  })

  it('calls /api/analyze with POST and correct headers', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockSuccessResponse,
      })
    )

    const { result } = renderHook(() => useNarrative())

    await act(async () => {
      await result.current.generate(DEFAULT_ASSUMPTIONS, dcfResult, 'test')
    })

    expect(fetch).toHaveBeenCalledWith('/api/analyze', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
  })

  it('clears previous narrative and error when generate is called again', async () => {
    // First call fails
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ error: { message: 'fail' } }),
      })
    )

    const { result } = renderHook(() => useNarrative())

    await act(async () => {
      await result.current.generate(DEFAULT_ASSUMPTIONS, dcfResult, 'test')
    })
    expect(result.current.error).toBe('fail')

    // Second call succeeds — error should be cleared
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockSuccessResponse,
      })
    )

    await act(async () => {
      await result.current.generate(DEFAULT_ASSUMPTIONS, dcfResult, 'test')
    })

    expect(result.current.error).toBeNull()
    expect(result.current.narrative).toBe('Roblox presents a compelling risk/reward.')
  })
})
