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
    });
    vi.clearAllMocks();
  });

  it('should notify and close if selection is empty', async () => {
    figma.currentPage.selection = [];
    await handleCopyCommand();
    expect(figma.notify).toHaveBeenCalledWith(
      'Please select exactly one object to copy.'
    );
    expect(figma.closePlugin).toHaveBeenCalled();
  });

  it('should notify and close if multiple objects are selected', async () => {
    figma.currentPage.selection = [
      {} as unknown as SceneNode,
      {} as unknown as SceneNode,
    ];
    await handleCopyCommand();
    expect(figma.notify).toHaveBeenCalledWith(
      'Please select exactly one object to copy.'
    );
    expect(figma.closePlugin).toHaveBeenCalled();
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
    expect(figma.closePlugin).toHaveBeenCalled();
  });

  it('should capture thumbnail during copy', async () => {
    const exportAsyncMock = vi
      .fn()
      .mockResolvedValue(new Uint8Array([137, 80, 78, 71]));
    const mockNode = {
      name: 'Test Node',
      exportAsync: exportAsyncMock,
      id: '1:1',
      parent: null,
    } as unknown as SceneNode;
    figma.currentPage.selection = [mockNode];
    const mockProps = { fills: [] };
    // biome-ignore lint/suspicious/noExplicitAny: Mocking
    vi.mocked(extraction.extractProperties).mockResolvedValue(mockProps as any);

    await handleCopyCommand();

    expect(exportAsyncMock).toHaveBeenCalledWith({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 },
    });
    expect(storage.saveProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockProps,
        preview: expect.any(Uint8Array),
        name: 'Test Node',
      })
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
    expect(figma.closePlugin).toHaveBeenCalled();
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
    expect(figma.closePlugin).toHaveBeenCalled();
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
