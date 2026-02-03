import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginMessage } from '../types';

// Mock dependencies
vi.mock('./commands', () => ({
  handleCopyCommand: vi.fn(),
  handlePasteCommand: vi.fn(),
  ALL_GRANULES: ['fills', 'strokes'],
}));

vi.mock('./storage', () => ({
  loadProperties: vi.fn().mockResolvedValue({ name: 'Test' }),
}));

describe('Main Process', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('figma', {
      command: '',
      showUI: vi.fn(),
      ui: {
        postMessage: vi.fn(),
        onmessage: null,
      },
      on: vi.fn(),
      currentPage: {
        selection: [],
      },
      clientStorage: {
        getAsync: vi.fn().mockResolvedValue(null),
        setAsync: vi.fn().mockResolvedValue(null),
      },
      notify: vi.fn(),
      closePlugin: vi.fn(),
    });
    vi.stubGlobal('__html__', '<div id="root"></div>');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should show UI and send initial state when no command is provided', async () => {
    // Setup
    // biome-ignore lint/suspicious/noExplicitAny: Mocking global
    (figma as any).command = '';

    // Execute
    await import('./main');

    // Simulate run event
    const onRun = (figma.on as any).mock.calls[0][1];
    onRun({ command: '' });

    // Give some time for async code to run
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify
    expect(figma.showUI).toHaveBeenCalled();
    // Check if postMessage was called (might be async due to loadProperties)
    await new Promise((resolve) => setTimeout(resolve, 10)); // simple wait for promise

    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DATA_UPDATE' })
    );
    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SELECTION_UPDATE' })
    );
  });

  it('should show UI and send initial state for open-ui command', async () => {
    // Setup
    // biome-ignore lint/suspicious/noExplicitAny: Mocking global
    (figma as any).command = 'open-ui';

    // Execute
    await import('./main');

    // Simulate run event
    // Find the 'run' handler (might be called multiple times if tests run in parallel/sequence without clearing modules fully, but beforeEach resets modules)
    const calls = (figma.on as any).mock.calls;
    const runCall = calls.find((c: any[]) => c[0] === 'run');
    if (runCall) {
      runCall[1]({ command: 'open-ui' });
    }

    // Give some time for async code to run (getAsync)
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify
    expect(figma.showUI).toHaveBeenCalled();

    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DATA_UPDATE' })
    );
    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SELECTION_UPDATE' })
    );
  });

  it('should send initial state when UI_READY message is received', async () => {
    // Setup
    // biome-ignore lint/suspicious/noExplicitAny: Mocking global
    (figma as any).command = 'open-ui';

    // Execute
    await import('./main');

    // reset mocks to clear initial calls
    vi.clearAllMocks();

    // Simulate sending UI_READY message
    const onMessage = figma.ui.onmessage as (msg: PluginMessage) => void;
    await onMessage({ type: 'UI_READY' });

    // Verify
    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DATA_UPDATE' })
    );
    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SELECTION_UPDATE' })
    );
  });
});
