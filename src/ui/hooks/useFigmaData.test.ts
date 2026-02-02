/// <reference types="vitest" />
// @vitest-environment jsdom

import { renderHook, act } from '@testing-library/react';
import { useFigmaData } from './useFigmaData';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';


describe('useFigmaData', () => {
  beforeEach(() => {
    vi.stubGlobal('parent', { postMessage: vi.fn() });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with null data', () => {
    const { result } = renderHook(() => useFigmaData());
    expect(result.current.data).toBeNull();
  });

  it('should update data on message', () => {
    const { result } = renderHook(() => useFigmaData());
    
    act(() => {
      const event = new MessageEvent('message', {
        data: { pluginMessage: { type: 'DATA_UPDATE', data: { name: 'Test' } } }
      });
      window.dispatchEvent(event);
    });

    expect(result.current.data).toEqual({ name: 'Test' });
  });
});
