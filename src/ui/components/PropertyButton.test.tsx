/// <reference types="vitest" />
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PropertyButton } from './PropertyButton';

describe('PropertyButton', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    label: 'Test Label',
    granules: ['test'],
    available: true,
    onPaste: vi.fn(),
  };

  it('should render the label', () => {
    render(<PropertyButton {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeDefined();
  });

  it('should call onPaste when clicked', () => {
    render(<PropertyButton {...defaultProps} />);
    fireEvent.click(screen.getByText('Test Label'));
    expect(defaultProps.onPaste).toHaveBeenCalledWith(['test']);
  });

  it('should be disabled when available is false', () => {
    render(<PropertyButton {...defaultProps} available={false} />);
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('should render the preview content when provided', () => {
    render(
      <PropertyButton
        {...defaultProps}
        // @ts-expect-error - Prop doesn't exist yet
        preview={<div data-testid='preview-element'>Preview Content</div>}
      />
    );
    expect(screen.getByTestId('preview-element')).toBeDefined();
  });
});
