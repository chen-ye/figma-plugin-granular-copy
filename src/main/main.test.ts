import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
    (figma as any).command = '';

    // Execute
    await import('./main');
    
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
    (figma as any).command = 'open-ui';

    // Execute
    await import('./main');

    // Verify
    expect(figma.showUI).toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DATA_UPDATE' })
    );
    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SELECTION_UPDATE' })
    );
  });

  it('should send initial state when UI_READY message is received', async () => {
    // Setup
    (figma as any).command = 'open-ui';

    // Execute
    await import('./main');

    // reset mocks to clear initial calls
    vi.clearAllMocks();

    // Simulate sending UI_READY message
    const onMessage = figma.ui.onmessage as (msg: any) => void;
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
