/// <reference types="vitest" />
// @vitest-environment jsdom

import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewHeader } from './PreviewHeader';
import { HeaderActions } from './HeaderActions';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('PreviewHeader', () => {
  it('should render the node name', () => {
    render(<PreviewHeader name='Rectangle 1' preview='' />);
    expect(screen.getByText('Rectangle 1')).toBeDefined();
  });

  it('should render the preview image', () => {
    render(<PreviewHeader name='Node' preview='base64bytes' />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('data:image/png;base64,base64bytes');
  });
});

describe('HeaderActions', () => {
  it('should send COPY_SELECTION message on click', () => {
    vi.stubGlobal('parent', { postMessage: vi.fn() });
    render(<HeaderActions />);

    fireEvent.click(screen.getByText('Copy Selection'));

    expect(parent.postMessage).toHaveBeenCalledWith(
      { pluginMessage: { type: 'COPY_SELECTION' } },
      '*'
    );
  });
});
