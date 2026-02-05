import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginMessage } from '../types';

// Mock figma type with mutable command property for testing
interface MockFigmaAPI {
  command: string;
  showUI: ReturnType<typeof vi.fn>;
  ui: {
    postMessage: ReturnType<typeof vi.fn>;
    onmessage: ((msg: PluginMessage) => void) | null;
  };
  on: ReturnType<typeof vi.fn>;
  currentPage: { selection: any[] };
  clientStorage: {
    getAsync: ReturnType<typeof vi.fn>;
    setAsync: ReturnType<typeof vi.fn>;
  };
  notify: ReturnType<typeof vi.fn>;
  closePlugin: ReturnType<typeof vi.fn>;
}

// Type for figma.on mock call: [eventType, handler]
type FigmaOnMockCall = [string, (event: any) => void];

// Mock dependencies
vi.mock('./commands', () => ({
  handleCopyCommand: vi.fn().mockResolvedValue(undefined),
  handlePasteCommand: vi.fn().mockResolvedValue(undefined),
  ALL_GRANULES: ['fills', 'strokes'],
}));

vi.mock('./storage', () => ({
  loadProperties: vi.fn().mockResolvedValue({ name: 'Test' }),
}));

vi.mock('./ui-handlers', () => ({
  handleUIMessage: vi.fn(),
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
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should show UI and send initial state when no command is provided', async () => {
    (figma as unknown as MockFigmaAPI).command = '';
    await import('./main');
    const mockCalls = vi.mocked(figma.on).mock
      .calls as unknown as FigmaOnMockCall[];
    const onRun = mockCalls.find((c) => c[0] === 'run')![1];
    onRun({ command: '' });

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(figma.showUI).toHaveBeenCalled();
    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DATA_UPDATE' })
    );
    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SELECTION_UPDATE' })
    );
  });

  it('should show UI and send initial state for open-ui command', async () => {
    (figma as unknown as MockFigmaAPI).command = 'open-ui';
    await import('./main');
    const mockCalls = vi.mocked(figma.on).mock
      .calls as unknown as FigmaOnMockCall[];
    const runCall = mockCalls.find((c) => c[0] === 'run')![1];
    runCall({ command: 'open-ui' });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(figma.showUI).toHaveBeenCalled();
  });

  it('should send initial state when UI_READY message is received', async () => {
    await import('./main');
    vi.clearAllMocks();
    const onMessage = figma.ui.onmessage as (msg: PluginMessage) => void;
    await onMessage({ type: 'UI_READY' });

    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DATA_UPDATE' })
    );
  });

  it('should handle selection change', async () => {
    await import('./main');
    const mockCalls = vi.mocked(figma.on).mock
      .calls as unknown as FigmaOnMockCall[];
    const selectionHandler = mockCalls.find(
      (c) => c[0] === 'selectionchange'
    )?.[1];

    expect(selectionHandler).toBeDefined();
    if (selectionHandler) {
      selectionHandler({});
    }

    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SELECTION_UPDATE' })
    );
  });

  it('should close plugin if UI does not respond to PING', async () => {
    vi.useFakeTimers();
    (figma as unknown as MockFigmaAPI).command = 'copy';
    await import('./main');

    const mockCalls = vi.mocked(figma.on).mock
      .calls as unknown as FigmaOnMockCall[];
    const onRun = mockCalls.find((c) => c[0] === 'run')![1];

    onRun({ command: 'copy' });

    // Flush microtasks to ensure we reach checkUIOpen and its setTimeout
    await vi.runAllTicks();
    await Promise.resolve();

    // Advance time to trigger the 200ms timeout
    vi.advanceTimersByTime(205);

    // Flush microtasks again to allow the promise to resolve and executeAndMaybeClose to finish
    await vi.runAllTicks();
    await Promise.resolve();

    expect(figma.closePlugin).toHaveBeenCalled();
  });

  it('should not close plugin if UI responds to PING with PONG', async () => {
    (figma as unknown as MockFigmaAPI).command = 'copy';
    await import('./main');

    const mockCalls = vi.mocked(figma.on).mock
      .calls as unknown as FigmaOnMockCall[];
    const onRun = mockCalls.find((c) => c[0] === 'run')![1];

    onRun({ command: 'copy' });

    // Wait a bit for it to reach checkUIOpen
    await Promise.resolve();

    const onMessage = figma.ui.onmessage as (msg: PluginMessage) => void;
    onMessage({ type: 'PONG' });

    await Promise.resolve();
    expect(figma.closePlugin).not.toHaveBeenCalled();
  });

  it('should handle various paste commands', async () => {
    const { handlePasteCommand } = await import('./commands');
    await import('./main');
    const mockCalls = vi.mocked(figma.on).mock
      .calls as unknown as FigmaOnMockCall[];
    const onRun = mockCalls.find((c) => c[0] === 'run')![1];

    const commands = [
      'paste-fills',
      'paste-strokes',
      'paste-effects',
      'paste-corner-radius',
      'paste-opacity',
      'paste-blend-mode',
      'paste-position',
      'paste-size',
      'paste-rotation',
      'paste-auto-layout',
      'paste-constraints',
      'paste-layout-grids',
      'paste-text-content',
      'paste-text-styles',
      'paste-export-settings',
      'paste-all',
    ];

    for (const command of commands) {
      onRun({ command });
      await Promise.resolve();
      expect(handlePasteCommand).toHaveBeenCalled();
    }
  });

  it('should handle errors when postMessage fails in checkUIOpen', async () => {
    (figma as unknown as MockFigmaAPI).command = 'copy';

    // Mock postMessage to throw
    vi.stubGlobal('figma', {
      ...figma,
      ui: {
        ...figma.ui,
        postMessage: vi.fn().mockImplementation(() => {
          throw new Error('postMessage failed');
        }),
      },
    });

    await import('./main');

    const mockCalls = vi.mocked(figma.on).mock
      .calls as unknown as FigmaOnMockCall[];
    const onRun = mockCalls.find((c) => c[0] === 'run')![1];

    onRun({ command: 'copy' });

    // Flush microtasks
    for (let i = 0; i < 10; i++) await Promise.resolve();

    expect(figma.closePlugin).toHaveBeenCalled();
  });

  it('should handle UI messages other than PONG and UI_READY', async () => {
    const { handleUIMessage } = await import('./ui-handlers');
    await import('./main');

    const onMessage = figma.ui.onmessage as (msg: PluginMessage) => void;
    onMessage({ type: 'PASTE_PROPERTY', granules: ['fills'] });

    expect(handleUIMessage).toHaveBeenCalledWith({
      type: 'PASTE_PROPERTY',
      granules: ['fills'],
    });
  });

  it('should handle saved UI size in clientStorage', async () => {
    vi.mocked(figma.clientStorage.getAsync).mockResolvedValue({
      width: 400,
      height: 500,
    });

    await import('./main');
    const mockCalls = vi.mocked(figma.on).mock
      .calls as unknown as FigmaOnMockCall[];
    const onRun = mockCalls.find((c) => c[0] === 'run')![1];
    onRun({ command: 'open-ui' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(figma.showUI).toHaveBeenCalledWith(
      __html__,
      expect.objectContaining({ width: 400, height: 500 })
    );
  });
});
