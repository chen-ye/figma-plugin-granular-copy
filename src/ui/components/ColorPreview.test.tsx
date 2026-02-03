/// <reference types="vitest" />
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ExtendedPaint } from '../../types';
import { ColorPreview } from './ColorPreview';

describe('ColorPreview', () => {
  afterEach(cleanup);

  it('should render solid color swatches', () => {
    const fills = [
      { type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 },
      { type: 'SOLID', color: { r: 0, g: 1, b: 0 }, opacity: 0.5 },
    ] as ExtendedPaint[];
    render(<ColorPreview fills={fills} />);
    // Check for existence of swatches via class
    expect(document.querySelectorAll('.color-swatch')).toHaveLength(2);
  });

  it('should render gradient swatches', () => {
    const fills = [
      {
        type: 'GRADIENT_LINEAR',
        gradientStops: [
          { color: { r: 0, g: 0, b: 0, a: 1 }, position: 0 },
          { color: { r: 1, g: 1, b: 1, a: 1 }, position: 1 },
        ],
        gradientTransform: [
          [1, 0, 0],
          [0, 1, 0],
        ],
      },
    ] as ExtendedPaint[];
    render(<ColorPreview fills={fills} />);
    expect(document.querySelectorAll('.color-swatch')).toHaveLength(1);
  });

  it('should render image swatches', () => {
    const fills = [
      { type: 'IMAGE', scaleMode: 'FILL', imageHash: 'hash' },
    ] as ExtendedPaint[];
    render(<ColorPreview fills={fills} />);
    expect(screen.getByText('IMG')).toBeDefined();
  });

  it('should display style name if provided', () => {
    const fills = [
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
    ] as ExtendedPaint[];
    render(<ColorPreview fills={fills} styleName='Brand Color' />);
    expect(screen.getByText('Brand Color')).toBeDefined();
  });

  it('should display variable name from fill', () => {
    const fills = [
      {
        type: 'SOLID',
        color: { r: 0, g: 0, b: 0 },
        variableName: 'Color/Primary',
      },
    ] as ExtendedPaint[];
    render(<ColorPreview fills={fills} />);
    expect(screen.getByText('Color/Primary')).toBeDefined();
  });

  it('should show both style name and variable badges separately', () => {
    const fills = [
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 }, variableName: 'Variable' },
    ] as ExtendedPaint[];
    render(<ColorPreview fills={fills} styleName='Style' />);
    // Style name is shown separately as tertiary text
    expect(screen.getByText('Style')).toBeDefined();
    // Variable name is shown in badge embedded with swatch
    expect(screen.getByText('Variable')).toBeDefined();
  });

  it('should limit to 4 swatches', () => {
    const fills = Array(6).fill({
      type: 'SOLID',
      color: { r: 0, g: 0, b: 0 },
    }) as ExtendedPaint[];
    render(<ColorPreview fills={fills} />);
    expect(document.querySelectorAll('.color-swatch')).toHaveLength(4);
  });
});
