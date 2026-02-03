/// <reference types="vitest" />
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PositionPreview } from './PositionPreview';

describe('PositionPreview', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render nothing if x and y are undefined', () => {
    const { container } = render(<PositionPreview />);
    expect(container.firstChild).toBeNull();
  });

  it('should render X only', () => {
    render(<PositionPreview x={100} />);
    expect(screen.getByText('X: 100')).toBeDefined();
    expect(screen.queryByText(/Y:/)).toBeNull();
  });

  it('should render Y only', () => {
    render(<PositionPreview y={200} />);
    expect(screen.getByText('Y: 200')).toBeDefined();
    expect(screen.queryByText(/X:/)).toBeNull();
  });

  it('should render X and Y rounded', () => {
    render(<PositionPreview x={10.5} y={20.1} />);
    expect(screen.getByText('X: 11')).toBeDefined();
    expect(screen.getByText('Y: 20')).toBeDefined();
  });
});
