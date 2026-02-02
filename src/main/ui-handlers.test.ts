import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleUIMessage } from './ui-handlers';
import * as commands from './commands';

vi.mock('./commands');

describe('UI Handlers', () => {
  it('should handle COPY_SELECTION', async () => {
    const msg = { type: 'COPY_SELECTION' };
    await handleUIMessage(msg);
    expect(commands.handleCopyCommand).toHaveBeenCalledWith({
      shouldClose: false,
    });
  });

  it('should handle PASTE_PROPERTY', async () => {
    const msg = { type: 'PASTE_PROPERTY', granules: ['fills'] };
    await handleUIMessage(msg);
    expect(commands.handlePasteCommand).toHaveBeenCalledWith(['fills'], {
      shouldClose: false,
    });
  });
});
