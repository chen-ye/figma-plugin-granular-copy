/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HeaderActions } from './HeaderActions';

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
