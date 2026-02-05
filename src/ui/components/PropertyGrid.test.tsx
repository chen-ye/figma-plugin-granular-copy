/// <reference types="vitest" />
// @vitest-environment jsdom

import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { PropertyButton } from './PropertyButton';

describe('PropertyButton', () => {
  afterEach(cleanup);
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
    expect(screen.getByRole('button', { name: 'Strokes' })).toHaveProperty(
      'disabled',
      true
    );
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
    fireEvent.click(screen.getByRole('button', { name: 'Effects' }));
    expect(onPaste).toHaveBeenCalledWith(['effects']);
  });
});
