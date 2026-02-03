/// <reference types="vitest" />
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ValuePreview } from './ValuePreview';

describe('ValuePreview', () => {
  afterEach(cleanup);

  it('should render a numeric value with px unit', () => {
    render(<ValuePreview value={10} unit='px' />);
    expect(screen.getByText('10px')).toBeDefined();
  });

  it('should render a percentage value', () => {
    render(<ValuePreview value={50} unit='%' />);
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('should render a degree value', () => {
    render(<ValuePreview value={45} unit='°' />);
    expect(screen.getByText('45°')).toBeDefined();
  });

  it('should handle string values', () => {
    render(<ValuePreview value='Auto' />);
    expect(screen.getByText('Auto')).toBeDefined();
  });

  it('should round numbers to 2 decimal places', () => {
    render(<ValuePreview value={10.1234} unit='px' />);
    expect(screen.getByText('10.12px')).toBeDefined();
  });
});
