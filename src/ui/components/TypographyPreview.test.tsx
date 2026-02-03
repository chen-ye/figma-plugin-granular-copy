/// <reference types="vitest" />
// @vitest-environment jsdom

import { render, screen, cleanup } from '@testing-library/react';
import { TypographyPreview } from './TypographyPreview';
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';

describe('TypographyPreview', () => {
  afterEach(cleanup);

  it('should render the style name if provided', () => {
    render(
      <TypographyPreview
        textStyleName="Heading / H1"
        fontName={{ family: 'Inter', style: 'Bold' }}
        fontSize={24}
      />
    );
    expect(screen.getByText('Heading / H1')).toBeDefined();
    expect(screen.queryByText('Inter Bold 24')).toBeNull();
  });

  it('should render compact summary if style name is missing', () => {
    render(
      <TypographyPreview
        fontName={{ family: 'Inter', style: 'Bold' }}
        fontSize={12}
      />
    );
    expect(screen.getByText('Inter Bold 12')).toBeDefined();
  });

  it('should handle undefined fontName', () => {
    render(<TypographyPreview fontSize={12} />);
    expect(screen.getByText('12')).toBeDefined();
  });
});
