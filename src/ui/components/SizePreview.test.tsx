/// <reference types="vitest" />
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SizePreview } from './SizePreview';

describe('SizePreview', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render nothing if width and height are undefined', () => {
    const { container } = render(<SizePreview />);
    expect(container.firstChild).toBeNull();
  });

  it('should render dimensions as W × H', () => {
    render(<SizePreview width={100} height={200} />);
    expect(screen.getByText('100 × 200')).toBeDefined();
  });

  it('should handle rounded numbers', () => {
    render(<SizePreview width={100.4} height={199.6} />);
    expect(screen.getByText('100 × 200')).toBeDefined();
  });

  it('should handle missing width or height with ?', () => {
    render(<SizePreview width={100} />);
    expect(screen.getByText('100 × ?')).toBeDefined();

    cleanup();
    render(<SizePreview height={200} />);
    expect(screen.getByText('? × 200')).toBeDefined();
  });
});
