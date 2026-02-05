/** @vitest-environment jsdom */
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { HeaderActions } from './HeaderActions';
import React from 'react';

describe('HeaderActions', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.stubGlobal('parent', {
      postMessage: vi.fn(),
    });
  });

  it('should send COPY_SELECTION message when copy button is clicked', () => {
    render(<HeaderActions />);
    const copyButton = screen.getByText('Copy Selection');
    fireEvent.click(copyButton);
    
    expect(parent.postMessage).toHaveBeenCalledWith(
      { pluginMessage: { type: 'COPY_SELECTION' } },
      '*'
    );
  });
});
