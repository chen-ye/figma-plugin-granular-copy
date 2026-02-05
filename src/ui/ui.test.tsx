/// <reference types="vitest" />
// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('UI Integration', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.stubGlobal('parent', {
      postMessage: vi.fn(),
    });
    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => cb(0));

    // Mock pointer capture which JSDOM doesn't support
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  it('should enable paste buttons when data is copied', async () => {
    render(<App />);
    // Use getByRole with name to be specific, or getByText
    const fillsButton = screen.getAllByRole('button', { name: /Fills/i })[0];

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

  it('should render various property previews when data is available', () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            pluginMessage: {
              type: 'COPY_COMPLETED',
              data: {
                fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
                strokes: [],
                effects: [{}, {}],
                opacity: 0.5,
                cornerRadius: 4,
                x: 10,
                y: 20,
                width: 100,
                height: 200,
                rotation: 45,
                blendMode: 'MULTIPLY',
                characters: 'Hello World',
                fontSize: 16,
                name: 'Test Node',
              },
            },
          },
        })
      );
    });

    expect(screen.getByText('50%')).toBeDefined(); // Opacity
    expect(screen.getByText('4')).toBeDefined(); // Corner Radius
    expect(screen.getByText('45°')).toBeDefined(); // Rotation
    expect(screen.getByText('Multiply')).toBeDefined(); // Blend Mode formatted
    expect(screen.getByText('Hello World')).toBeDefined(); // Text Content
  });

  it('should handle "Paste All" button click', () => {
    render(<App />);
    const pasteAllButton = screen.getByRole('button', { name: /Paste All/i });
    fireEvent.click(pasteAllButton);

    expect(parent.postMessage).toHaveBeenCalledWith(
      { pluginMessage: { type: 'PASTE_PROPERTY', granules: ['all'] } },
      '*'
    );
  });

  it('should handle UI resizing via handle', () => {
    render(<App />);
    const handle = document.querySelector('.resize-handle')!;

    // Simulate resize drag
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 200, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 200, pointerId: 1 });

    expect(parent.postMessage).toHaveBeenLastCalledWith(
      {
        pluginMessage: {
          type: 'SAVE_UI_SIZE',
          width: window.innerWidth,
          height: expect.any(Number),
        },
      },
      '*'
    );
  });
});
