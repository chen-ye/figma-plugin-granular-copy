import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCopyCommand } from './commands';
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
