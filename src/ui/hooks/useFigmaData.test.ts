/// <reference types="vitest" />
// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFigmaData } from './useFigmaData';

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
        data: {
          pluginMessage: { type: 'DATA_UPDATE', data: { name: 'Test' } },
        },
      });
      window.dispatchEvent(event);
    });

    expect(result.current.data).toEqual({ name: 'Test' });
  });

  it('should handle COPY_COMPLETED event', () => {
    const { result } = renderHook(() => useFigmaData());

    // First simulate a selection update so we have some supported granules
    act(() => {
      const event = new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'SELECTION_UPDATE',
            supportedGranules: ['fills', 'strokes'],
          },
        },
      });
      window.dispatchEvent(event);
    });

    expect(result.current.supportedGranules).toEqual(['fills', 'strokes']);

    // Now simulate copy completion
    const copyData = {
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
    };
    act(() => {
      const event = new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'COPY_COMPLETED',
            data: copyData,
          },
        },
      });
      window.dispatchEvent(event);
    });

    expect(result.current.data).toEqual(copyData);
    // Ensure supportedGranules didn't get wiped out if the message didn't include them
    expect(result.current.supportedGranules).toEqual(['fills', 'strokes']);
  });
});
