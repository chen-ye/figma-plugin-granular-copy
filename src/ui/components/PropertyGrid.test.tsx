/// <reference types="vitest" />
// @vitest-environment jsdom

import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyButton } from './PropertyButton';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('PropertyButton', () => {
  it('should render label', () => {
    render(
      <PropertyButton
        label='Fills'
        granules={['fills']}
        available={true}
        onPaste={() => {}}
      />
    );
    expect(screen.getByText('Fills')).toBeDefined();
  });

  it('should be disabled if not available', () => {
    render(
      <PropertyButton
        label='Strokes'
        granules={['strokes']}
        available={false}
        onPaste={() => {}}
      />
    );
    expect(screen.getByText('Strokes')).toHaveProperty('disabled', true);
  });

  it('should call onPaste with granules when clicked', () => {
    const onPaste = vi.fn();
    render(
      <PropertyButton
        label='Effects'
        granules={['effects']}
        available={true}
        onPaste={onPaste}
      />
    );

    fireEvent.click(screen.getByText('Effects'));
    expect(onPaste).toHaveBeenCalledWith(['effects']);
  });
});
