/// <reference types="vitest" />
// @vitest-environment jsdom

import { render, screen, cleanup } from '@testing-library/react';
import { EffectPreview } from './EffectPreview';
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';

describe('EffectPreview', () => {
  afterEach(cleanup);

  it('should render effect count', () => {
    render(<EffectPreview count={3} />);
    expect(screen.getByText('3 effects')).toBeDefined();
  });

  it('should render single effect', () => {
    render(<EffectPreview count={1} />);
    expect(screen.getByText('1 effect')).toBeDefined();
  });

  it('should render style name if provided', () => {
    render(<EffectPreview count={1} styleName="Effect Style" />);
    expect(screen.getByText('Effect Style')).toBeDefined();
  });
});
