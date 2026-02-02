import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCopyCommand, handlePasteCommand } from './commands';
import * as storage from './storage';
import * as extraction from './extraction';

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
    expect(figma.notify).toHaveBeenCalledWith('Please select exactly one object to copy.');
    expect(figma.closePlugin).toHaveBeenCalled();
  });

  it('should notify and close if multiple objects are selected', async () => {
    figma.currentPage.selection = [{} as any, {} as any];
    await handleCopyCommand();
    expect(figma.notify).toHaveBeenCalledWith('Please select exactly one object to copy.');
    expect(figma.closePlugin).toHaveBeenCalled();
  });

  it('should extract properties and save to storage for a single selection', async () => {
    const mockNode = { name: 'Test Node' } as any;
    figma.currentPage.selection = [mockNode];
    const mockProps = { fills: [] };
    vi.mocked(extraction.extractProperties).mockReturnValue(mockProps);

    await handleCopyCommand();

    expect(extraction.extractProperties).toHaveBeenCalledWith(mockNode, expect.any(Array));
    expect(storage.saveProperties).toHaveBeenCalledWith(mockProps);
    expect(figma.notify).toHaveBeenCalledWith('Properties copied from Test Node');
    expect(figma.closePlugin).toHaveBeenCalled();
  });
});

describe('Commands: Paste', () => {
  beforeEach(() => {
    vi.stubGlobal('figma', {
      currentPage: { selection: [] },
      notify: vi.fn(),
      closePlugin: vi.fn(),
    });
    vi.clearAllMocks();
  });

  it('should notify if nothing is copied', async () => {
    vi.mocked(storage.loadProperties).mockResolvedValue(null);
    await handlePasteCommand(['fills']);
    expect(figma.notify).toHaveBeenCalledWith('No properties copied yet. Use Copy first.');
    expect(figma.closePlugin).toHaveBeenCalled();
  });

  it('should apply properties to all selected objects', async () => {
    const mockProps = { fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] };
    vi.mocked(storage.loadProperties).mockResolvedValue(mockProps);
    
    const mockNode1 = { name: 'Node 1', fills: [] } as any;
    const mockNode2 = { name: 'Node 2', fills: [] } as any;
    figma.currentPage.selection = [mockNode1, mockNode2];

    await handlePasteCommand(['fills']);

    expect(mockNode1.fills).toEqual(mockProps.fills);
    expect(mockNode2.fills).toEqual(mockProps.fills);
    expect(figma.notify).toHaveBeenCalledWith('Pasted fills to 2 objects');
    expect(figma.closePlugin).toHaveBeenCalled();
  });

  it('should handle incompatible nodes and list them in notification', async () => {
    const mockProps = { fills: [{ type: 'SOLID' }] };
    vi.mocked(storage.loadProperties).mockResolvedValue(mockProps);
    
    // We mock that 'fills' property exists on Node 1 but not Node 2
    const mockNode1 = { name: 'Rectangle' };
    Object.defineProperty(mockNode1, 'fills', { value: [], writable: true, enumerable: true });
    
    const mockNode2 = { name: 'Group' } as any;
    
    figma.currentPage.selection = [mockNode1 as any, mockNode2];

    await handlePasteCommand(['fills']);

    expect((mockNode1 as any).fills).toEqual(mockProps.fills);
    expect(figma.notify).toHaveBeenCalledWith('Pasted fills to 1 object. Skipped Group (incompatible).');
  });
});

