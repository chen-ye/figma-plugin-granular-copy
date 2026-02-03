import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCopyCommand, handlePasteCommand } from './commands';
import * as extraction from './extraction';
import * as storage from './storage';

vi.mock('./storage');
vi.mock('./extraction');

describe('Commands: Copy', () => {
  beforeEach(() => {
    vi.stubGlobal('figma', {
      currentPage: { selection: [] },
      notify: vi.fn(),
      closePlugin: vi.fn(),
      clientStorage: {
        getAsync: vi.fn().mockResolvedValue({ width: 320 }),
        setAsync: vi.fn(),
      },
      ui: {
        postMessage: vi.fn(),
      },
    });
    vi.clearAllMocks();
  });

  it('should notify if selection is empty', async () => {
    figma.currentPage.selection = [];
    await handleCopyCommand();
    expect(figma.notify).toHaveBeenCalledWith(
      'Please select exactly one object to copy.'
    );
    expect(figma.closePlugin).not.toHaveBeenCalled();
  });

  it('should notify if multiple objects are selected', async () => {
    figma.currentPage.selection = [
      {} as unknown as SceneNode,
      {} as unknown as SceneNode,
    ];
    await handleCopyCommand();
    expect(figma.notify).toHaveBeenCalledWith(
      'Please select exactly one object to copy.'
    );
    expect(figma.closePlugin).not.toHaveBeenCalled();
  });

  it('should extract properties and save to storage for a single selection', async () => {
    const mockNode = {
      name: 'Test Node',
      exportAsync: vi.fn().mockResolvedValue(new Uint8Array([])),
      id: '1:1',
      parent: null,
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];
    const mockProps = { fills: [] };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(extraction.extractProperties).mockResolvedValue(mockProps as any);

    await handleCopyCommand();

    expect(extraction.extractProperties).toHaveBeenCalledWith(
      mockNode,
      expect.any(Array)
    );
    expect(storage.saveProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockProps,
        preview: expect.any(Uint8Array),
        name: 'Test Node',
      })
    );
    expect(figma.notify).toHaveBeenCalledWith(
      'Properties copied from Test Node'
    );
    expect(figma.closePlugin).not.toHaveBeenCalled();
  });

  it('should NOT close plugin by default', async () => {
    const mockNode = {
      name: 'Test Node',
      exportAsync: vi.fn().mockResolvedValue(new Uint8Array([])),
      id: '1:1',
      parent: null,
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];
    const mockProps = { fills: [] };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(extraction.extractProperties).mockResolvedValue(mockProps as any);

    await handleCopyCommand();

    expect(storage.saveProperties).toHaveBeenCalled();
    expect(figma.notify).toHaveBeenCalled();
    expect(figma.closePlugin).not.toHaveBeenCalled();
    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'COPY_COMPLETED' })
    );
  });
  it('should handle headless execution where postMessage throws', async () => {
    const mockNode = {
      name: 'Test Node',
      exportAsync: vi.fn().mockResolvedValue(new Uint8Array([])),
      id: '1:1',
      parent: null,
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];
    const mockProps = { fills: [] };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(extraction.extractProperties).mockResolvedValue(mockProps as any);

    // Simulate postMessage throwing error (headless mode)
    figma.ui.postMessage = vi.fn().mockImplementation(() => {
      throw new Error('No UI to send a message to');
    });

    // Should not throw
    await handleCopyCommand();

    expect(storage.saveProperties).toHaveBeenCalled();
    expect(figma.notify).toHaveBeenCalled();
  });
  it('should capture thumbnail during copy with optimized scale', async () => {
    // Mock window size
    (
      figma.clientStorage.getAsync as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ width: 300 });

    const exportAsyncMock = vi
      .fn()
      .mockResolvedValue(new Uint8Array([137, 80, 78, 71]));

    // Test with small node: 100x100. Target (300*2)=600. 100*2 = 200 <= 600. Max scale 2.
    const mockNode = {
      name: 'Small Node',
      exportAsync: exportAsyncMock,
      id: '1:1',
      parent: null,
      width: 100,
      height: 100,
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];
    const mockProps = { fills: [] };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(extraction.extractProperties).mockResolvedValue(mockProps as any);

    await handleCopyCommand();

    // Check that getAsync was called
    expect(figma.clientStorage.getAsync).toHaveBeenCalledWith(
      'plugin_window_size'
    );

    // Expect 2x scale for small node
    expect(exportAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        constraint: { type: 'SCALE', value: 2 },
      })
    );
    expect(storage.saveProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockProps,
        preview: expect.any(Uint8Array),
        name: 'Small Node',
      })
    );
  });

  it('should downscale large nodes in thumbnail capture', async () => {
    // Mock window size
    (
      figma.clientStorage.getAsync as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ width: 320 });
    // Target Width = 640. Target Height = 240.

    const exportAsyncMock = vi.fn().mockResolvedValue(new Uint8Array([]));

    // Huge node: 6400px width.
    // scale limit = 640 / 6400 = 0.1.
    // SCALES = [..., 0.1]. Should match 0.1.
    const mockNode = {
      name: 'Large Node',
      exportAsync: exportAsyncMock,
      id: '1:2',
      parent: null,
      width: 6400,
      height: 100,
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(extraction.extractProperties).mockResolvedValue({} as any);

    await handleCopyCommand();

    expect(exportAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        constraint: { type: 'SCALE', value: 0.1 },
      })
    );
  });
  it('should set previewLabel to light for bright fills', async () => {
    // Mock window size
    (
      figma.clientStorage.getAsync as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ width: 320 });
    const exportAsyncMock = vi.fn().mockResolvedValue(new Uint8Array([]));

    const mockNode = {
      name: 'Light Node',
      exportAsync: exportAsyncMock,
      id: '1:3',
      parent: null,
      width: 100,
      height: 100,
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];

    const mockProps = {
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, visible: true }],
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(extraction.extractProperties).mockResolvedValue(mockProps as any);

    await handleCopyCommand();

    expect(storage.saveProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        previewLabel: 'light',
      })
    );
  });

  it('should set previewLabel to dark for dark fills', async () => {
    // Mock window size
    (
      figma.clientStorage.getAsync as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ width: 320 });
    const exportAsyncMock = vi.fn().mockResolvedValue(new Uint8Array([]));

    const mockNode = {
      name: 'Dark Node',
      exportAsync: exportAsyncMock,
      id: '1:4',
      parent: null,
      width: 100,
      height: 100,
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];

    const mockProps = {
      fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, visible: true }],
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(extraction.extractProperties).mockResolvedValue(mockProps as any);

    await handleCopyCommand();

    expect(storage.saveProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        previewLabel: 'dark',
      })
    );
  });

  it('should clear previous properties when copying a new node with fewer properties', async () => {
    // Setup initial copy with fills
    const mockNode1 = {
      name: 'Rect',
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
      exportAsync: vi.fn().mockResolvedValue(new Uint8Array([])),
      id: '1:1',
      parent: null,
      width: 100,
      height: 100,
    } as unknown as SceneNode;

    // Simulate node having 'fills' property
    Object.defineProperty(mockNode1, 'fills', {
      value: [],
      enumerable: true,
    });

    figma.currentPage.selection = [mockNode1];

    // Mock extraction returning fills
    vi.mocked(extraction.extractProperties).mockResolvedValueOnce({
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } } as any],
    });

    await handleCopyCommand();

    // Verify first save has fills
    expect(storage.saveProperties).toHaveBeenLastCalledWith(
      expect.objectContaining({ fills: expect.anything() })
    );

    // Setup second copy with NO fills (e.g. Group)
    const mockNode2 = {
      name: 'Group',
      exportAsync: vi.fn().mockResolvedValue(new Uint8Array([])),
      id: '1:2',
      parent: null,
      width: 100,
      height: 100,
      // No fills property
    } as unknown as SceneNode;

    figma.currentPage.selection = [mockNode2];

    // Mock extraction returning empty object (no fills)
    vi.mocked(extraction.extractProperties).mockResolvedValueOnce({});

    await handleCopyCommand();

    // Verify second save does NOT have fills
    expect(storage.saveProperties).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ fills: expect.anything() })
    );
  });
});

describe('Commands: Paste', () => {
  beforeEach(() => {
    vi.stubGlobal('figma', {
      currentPage: { selection: [] },
      notify: vi.fn(),
      closePlugin: vi.fn(),
      loadFontAsync: vi.fn().mockResolvedValue(undefined),
    });
    vi.clearAllMocks();
  });

  it('should notify if nothing is copied', async () => {
    vi.mocked(storage.loadProperties).mockResolvedValue(null);
    await handlePasteCommand(['fills']);
    expect(figma.notify).toHaveBeenCalledWith(
      'No properties copied yet. Use Copy first.'
    );
    expect(figma.closePlugin).not.toHaveBeenCalled();
  });

  it('should apply properties to all selected objects', async () => {
    const mockProps = {
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(storage.loadProperties).mockResolvedValue(mockProps as any);

    const mockNode1 = { name: 'Node 1', fills: [] } as unknown as SceneNode;
    const mockNode2 = { name: 'Node 2', fills: [] } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode1, mockNode2];

    await handlePasteCommand(['fills']);

    expect((mockNode1 as GeometryMixin).fills).toEqual(mockProps.fills);
    expect((mockNode2 as GeometryMixin).fills).toEqual(mockProps.fills);
    expect(figma.notify).toHaveBeenCalledWith('Pasted fills to 2 objects');
    expect(figma.closePlugin).not.toHaveBeenCalled();
  });

  it('should handle incompatible nodes and list them in notification', async () => {
    const mockProps = { fills: [{ type: 'SOLID' }] };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(storage.loadProperties).mockResolvedValue(mockProps as any);

    // We mock that 'fills' property exists on Node 1 but not Node 2
    const mockNode1 = { name: 'Rectangle' };
    Object.defineProperty(mockNode1, 'fills', {
      value: [],
      writable: true,
      enumerable: true,
    });

    const mockNode2 = { name: 'Group' } as unknown as SceneNode;

    figma.currentPage.selection = [
      mockNode1 as unknown as SceneNode,
      mockNode2,
    ];

    await handlePasteCommand(['fills']);

    // biome-ignore lint/suspicious/noExplicitAny: Dynamic test object
    expect((mockNode1 as any).fills).toEqual(mockProps.fills);
    expect(figma.notify).toHaveBeenCalledWith(
      'Pasted fills to 1 object. Skipped Group (incompatible).'
    );
  });

  it('should apply visual and layout properties', async () => {
    const mockProps = {
      rotation: 45,
      opacity: 0.5,
      cornerRadius: 10,
      x: 50,
      y: 50,
      constraints: { horizontal: 'MIN', vertical: 'MIN' },
      blendMode: 'DARKEN',
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(storage.loadProperties).mockResolvedValue(mockProps as any);

    const mockNode = {
      name: 'Node',
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      x: 0,
      y: 0,
      constraints: { horizontal: 'CENTER', vertical: 'CENTER' },
      blendMode: 'NORMAL',
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];

    await handlePasteCommand([
      'rotation',
      'opacity',
      'cornerRadius',
      'x',
      'y',
      'constraints',
      'blendMode',
    ]);

    expect((mockNode as LayoutMixin).rotation).toBe(45);
    expect((mockNode as BlendMixin).opacity).toBe(0.5);
    expect((mockNode as RectangleNode).cornerRadius).toBe(10);
    expect((mockNode as LayoutMixin).x).toBe(50);
    expect((mockNode as LayoutMixin).y).toBe(50);
    expect((mockNode as ConstraintMixin).constraints).toEqual(
      mockProps.constraints
    );
    expect((mockNode as BlendMixin).blendMode).toBe('DARKEN');
  });

  it('should apply contextual sizing modes when inside auto layout', async () => {
    const mockProps = {
      width: 100,
      height: 200,
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'FILL',
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(storage.loadProperties).mockResolvedValue(mockProps as any);

    const mockParent = { type: 'FRAME', layoutMode: 'HORIZONTAL' };
    const mockNode = {
      name: 'Node',
      parent: mockParent,
      primaryAxisSizingMode: 'HUG',
      counterAxisSizingMode: 'HUG',
      resize: vi.fn(),
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];

    await handlePasteCommand(['width', 'height']);

    expect((mockNode as FrameNode).primaryAxisSizingMode).toBe('FIXED');
    expect((mockNode as FrameNode).counterAxisSizingMode).toBe('FILL');
  });

  it('should apply raw dimensions when not in auto layout', async () => {
    const mockProps = {
      width: 100,
      height: 200,
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(storage.loadProperties).mockResolvedValue(mockProps as any);

    const resizeMock = vi.fn();
    const mockNode = {
      name: 'Node',
      resize: resizeMock,
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];

    await handlePasteCommand(['width', 'height']);

    expect(resizeMock).toHaveBeenCalledWith(100, 200);
  });

  it('should apply text content and styles', async () => {
    const mockProps = {
      characters: 'New Content',
      textStyleId: 'style-456',
      fontSize: 20,
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(storage.loadProperties).mockResolvedValue(mockProps as any);

    const mockNode = {
      name: 'Text Node',
      type: 'TEXT',
      characters: 'Old Content',
      textStyleId: '',
      fontSize: 12,
      fontName: { family: 'Inter', style: 'Regular' },
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];

    await handlePasteCommand(['characters', 'textStyleId', 'fontSize']);

    expect((mockNode as TextNode).characters).toBe('New Content');
    expect((mockNode as TextNode).textStyleId).toBe('style-456');
    expect((mockNode as TextNode).fontSize).toBe(20);
  });
});
