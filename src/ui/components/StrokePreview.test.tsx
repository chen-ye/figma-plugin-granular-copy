/// <reference types="vitest" />
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Paint } from '../../types';
import { StrokePreview } from './StrokePreview';

describe('StrokePreview', () => {
  afterEach(cleanup);

  const solidStroke: Paint = {
    type: 'SOLID',
    color: { r: 0, g: 0, b: 0 },
  } as Paint;

  it('should render stroke weight', () => {
    render(<StrokePreview strokes={[solidStroke]} weight={2} />);
    expect(screen.getByText('2px')).toBeDefined();
  });

  it('should render stroke swatches', () => {
    render(<StrokePreview strokes={[solidStroke, solidStroke]} weight={1} />);
    expect(document.querySelectorAll('.color-swatch')).toHaveLength(2);
  });

  it('should render style name if provided', () => {
    render(
      <StrokePreview
        strokes={[solidStroke]}
        weight={1}
        styleName='Stroke Style'
      />
    );
    expect(screen.getByText('Stroke Style')).toBeDefined();
  });

  it('should render variable name from stroke', () => {
    const strokeWithVar: Paint = {
      ...solidStroke,
    };
    const metadata = { 0: { variableName: 'Stroke/Primary' } };
    render(
      <StrokePreview strokes={[strokeWithVar]} metadata={metadata} weight={1} />
    );
    expect(screen.getByText('Stroke/Primary')).toBeDefined();
  });

  it('should limit to 4 swatches', () => {
    const strokes = Array(6).fill(solidStroke) as Paint[];
    render(<StrokePreview strokes={strokes} weight={1} />);
    expect(document.querySelectorAll('.color-swatch')).toHaveLength(4);
  });

  it('should return null for empty strokes', () => {
    const { container } = render(<StrokePreview strokes={[]} weight={1} />);
    expect(container.firstChild).toBeNull();
  });
});
