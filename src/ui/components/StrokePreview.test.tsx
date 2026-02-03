/// <reference types="vitest" />
// @vitest-environment jsdom

import { render, screen, cleanup } from '@testing-library/react';
import { StrokePreview } from './StrokePreview';
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';

describe('StrokePreview', () => {
  afterEach(cleanup);

  it('should render stroke weight', () => {
    render(<StrokePreview weight={2} />);
    expect(screen.getByText('2px')).toBeDefined();
  });

  it('should render style name if provided', () => {
    render(<StrokePreview weight={1} styleName="Stroke Style" />);
    expect(screen.getByText('Stroke Style')).toBeDefined();
  });

  it('should render variable name if provided', () => {
    render(<StrokePreview weight={1} variableName="Stroke Variable" />);
    expect(screen.getByText('Stroke Variable')).toBeDefined();
  });

  it('should prioritize style over variable', () => {
    render(<StrokePreview weight={1} styleName="Style" variableName="Variable" />);
    expect(screen.getByText('Style')).toBeDefined();
    expect(screen.queryByText('Variable')).toBeNull();
  });
});
