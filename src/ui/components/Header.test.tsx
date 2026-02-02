/// <reference types="vitest" />
// @vitest-environment jsdom

import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewHeader } from './PreviewHeader';
import { HeaderActions } from './HeaderActions';
import { describe, it, expect, vi } from 'vitest';

describe('PreviewHeader', () => {
  it('should render the node name', () => {
    render(<PreviewHeader name='Rectangle 1' preview={null} />);
    expect(screen.getByText('Rectangle 1')).toBeDefined();
  });

  it('should render the preview image', () => {
    // Mock URL.createObjectURL
    const createObjectURL = vi.fn(() => 'blob:url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    render(<PreviewHeader name='Node' preview={[1, 2, 3]} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('blob:url');
    expect(createObjectURL).toHaveBeenCalled();
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
