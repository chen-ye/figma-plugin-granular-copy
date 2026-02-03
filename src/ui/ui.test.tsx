/// <reference types="vitest" />
// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { App } from './App';

describe('UI Integration', () => {
  it('should enable paste buttons when data is copied', async () => {
    render(<App />);
    const fillsButton = screen.getByText('Fills');

    // Initially disabled
    expect(fillsButton).toHaveProperty('disabled', true);

    // 1. Simulate changing selection to something that supports fills
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            pluginMessage: {
              type: 'SELECTION_UPDATE',
              supportedGranules: ['fills'],
            },
          },
        })
      );
    });

    // Still disabled because we haven't copied anything yet
    expect(fillsButton).toHaveProperty('disabled', true);

    // 2. Simulate Copy Completion (user clicked copy, backend responded)
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            pluginMessage: {
              type: 'COPY_COMPLETED',
              data: {
                fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
                name: 'Rectangle 1',
              },
            },
          },
        })
      );
    });

    // NOW it should be enabled
    expect(fillsButton).toHaveProperty('disabled', false);
  });
});
