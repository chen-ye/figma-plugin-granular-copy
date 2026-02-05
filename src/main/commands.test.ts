import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCopyCommand, handlePasteCommand } from './commands';
import { extractProperties } from './extraction';
import { loadProperties, saveProperties } from './storage';

// Mock dependencies
vi.mock('./extraction', () => ({
  extractProperties: vi.fn(),
}));

vi.mock('./storage', () => ({
  loadProperties: vi.fn(),
  saveProperties: vi.fn(),
}));

describe('Commands', () => {
  beforeEach(() => {
    vi.stubGlobal('figma', {
      currentPage: {
        selection: [
          {
            id: '1:1',
            name: 'Rectangle 1',
            width: 100,
            height: 100,
            exportAsync: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
            parent: { type: 'PAGE' },
          },
        ],
      },
      notify: vi.fn(),
      clientStorage: {
        getAsync: vi.fn().mockResolvedValue(null),
        setAsync: vi.fn().mockResolvedValue(null),
      },
      loadFontAsync: vi.fn().mockResolvedValue(undefined),
      variables: {
        getVariableByIdAsync: vi.fn(),
      },
      ui: {
        postMessage: vi.fn(),
      },
    });
    vi.mocked(extractProperties).mockResolvedValue({ fills: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('Copy', () => {
    it('should handle single selection', async () => {
      await handleCopyCommand();
      expect(extractProperties).toHaveBeenCalled();
      expect(saveProperties).toHaveBeenCalled();
      expect(figma.notify).toHaveBeenCalledWith(
        expect.stringContaining('Rectangle 1')
      );
    });

    it('should handle zero selection', async () => {
      figma.currentPage.selection = [];
      await handleCopyCommand();
      expect(figma.notify).toHaveBeenCalledWith(
        'Please select exactly one object to copy.'
      );
    });

    it('should handle multiple selection', async () => {
      figma.currentPage.selection = [{}, {}] as any;
      await handleCopyCommand();
      expect(figma.notify).toHaveBeenCalledWith(
        'Please select exactly one object to copy.'
      );
    });

    it('should determine luminance from solid fills', async () => {
      // Light fill -> light component
      vi.mocked(extractProperties).mockResolvedValue({
        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, visible: true }],
      });
      await handleCopyCommand();
      expect(vi.mocked(saveProperties)).toHaveBeenLastCalledWith(
        expect.objectContaining({ previewLabel: 'light' })
      );

      vi.clearAllMocks();

      // Dark fill -> dark component
      vi.mocked(extractProperties).mockResolvedValue({
        fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, visible: true }],
      });
      await handleCopyCommand();
      expect(vi.mocked(saveProperties)).toHaveBeenLastCalledWith(
        expect.objectContaining({ previewLabel: 'dark' })
      );
    });

    it('should handle huge node preview scaling', async () => {
      const node = figma.currentPage.selection[0];
      Object.assign(node, { width: 10000, height: 10000 });
      await handleCopyCommand();
      expect(node.exportAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          constraint: { type: 'SCALE', value: 0.024 },
        })
      );
    });

    it('should handle headless execution where postMessage throws', async () => {
      vi.mocked(figma.ui.postMessage).mockImplementation(() => {
        throw new Error('No UI to send a message to');
      });
      // Should not throw exception from handler
      await handleCopyCommand();
      expect(saveProperties).toHaveBeenCalled();
    });
  });

  describe('Paste', () => {
    it('should handle no data', async () => {
      vi.mocked(loadProperties).mockResolvedValue(null);
      await handlePasteCommand(['fills']);
      expect(figma.notify).toHaveBeenCalledWith(
        expect.stringContaining('No properties copied yet')
      );
    });

    it('should handle no selection', async () => {
      vi.mocked(loadProperties).mockResolvedValue({ fills: [] });
      figma.currentPage.selection = [];
      await handlePasteCommand(['fills']);
      expect(figma.notify).toHaveBeenCalledWith(
        expect.stringContaining('Please select at least one object')
      );
    });

    it('should paste properties to selection', async () => {
      const data = { fills: [{ type: 'SOLID' }] };
      vi.mocked(loadProperties).mockResolvedValue(data as any);
      const targetNode = {
        name: 'Target',
        fills: [],
      };
      figma.currentPage.selection = [targetNode as any];

      await handlePasteCommand(['fills']);
      expect(targetNode.fills).toEqual(data.fills);
      expect(figma.notify).toHaveBeenCalledWith(
        expect.stringContaining('Pasted fills to 1 object')
      );
    });

    it('should handle font loading for text properties', async () => {
      const data = {
        characters: 'Hello',
        fontName: { family: 'Inter', style: 'Regular' },
      };
      vi.mocked(loadProperties).mockResolvedValue(data);
      const textNode = {
        type: 'TEXT',
        characters: '',
        fontName: { family: 'Inter', style: 'Regular' },
      };
      figma.currentPage.selection = [textNode as any];

      await handlePasteCommand(['characters']);
      expect(figma.loadFontAsync).toHaveBeenCalledWith(data.fontName);
      expect(textNode.characters).toBe('Hello');
    });

    it('should handle font loading failure', async () => {
      vi.mocked(figma.loadFontAsync).mockRejectedValue(
        new Error('Font failed')
      );
      const data = { characters: 'Hello' };
      vi.mocked(loadProperties).mockResolvedValue(data);
      const textNode = { type: 'TEXT', characters: '' };
      figma.currentPage.selection = [textNode as any];

      await handlePasteCommand(['characters']);
      expect(figma.notify).toHaveBeenCalled(); // Success count should still be 1 if assignment works despite font load fail (though figma API would fail IRL, our mock doesn't)
    });

    it('should handle sizing modes in Auto Layout', async () => {
      const data = {
        primaryAxisSizingMode: 'AUTO',
        counterAxisSizingMode: 'FIXED',
      };
      vi.mocked(loadProperties).mockResolvedValue(data);

      const parent = { type: 'FRAME', layoutMode: 'HORIZONTAL' };
      const node = {
        type: 'FRAME',
        name: 'Child',
        parent,
        primaryAxisSizingMode: 'FIXED',
        counterAxisSizingMode: 'AUTO',
        resize: vi.fn(),
      };
      figma.currentPage.selection = [node as any];

      await handlePasteCommand(['width', 'height']);
      expect(node.primaryAxisSizingMode).toBe('AUTO');
      expect(node.counterAxisSizingMode).toBe('FIXED');
      expect(node.resize).not.toHaveBeenCalled();
    });

    it('should handle skipped nodes', async () => {
      const data = { fills: [] };
      vi.mocked(loadProperties).mockResolvedValue(data);
      const node = { name: 'Vector', type: 'VECTOR' }; // doesn't have fills in our mock's eyes if we don't put it there
      figma.currentPage.selection = [node as any];

      await handlePasteCommand(['fills']);
      expect(figma.notify).toHaveBeenCalledWith(
        expect.stringContaining('Skipped Vector')
      );
    });

    it('should handle resize error', async () => {
      const data = { width: 100, height: 100 };
      vi.mocked(loadProperties).mockResolvedValue(data);
      const node = {
        name: 'ErrorNode',
        resize: vi.fn().mockImplementation(() => {
          throw new Error('Resize failed');
        }),
      };
      figma.currentPage.selection = [node as any];

      await handlePasteCommand(['width', 'height']);
      expect(figma.notify).toHaveBeenCalledWith(
        expect.stringContaining('Pasted width, height to 0 objects')
      );
    });
  });
});
