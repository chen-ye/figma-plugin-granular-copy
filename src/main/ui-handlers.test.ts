import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginMessage } from '../types';
import * as commands from './commands';
import { handleUIMessage } from './ui-handlers';

vi.mock('./commands', () => ({
  handleCopyCommand: vi.fn(),
  handlePasteCommand: vi.fn(),
  ALL_GRANULES: ['fills', 'strokes'],
}));

describe('UI Handlers', () => {
  beforeEach(() => {
    vi.stubGlobal('figma', {
      getNodeByIdAsync: vi.fn(),
      currentPage: { selection: [] },
      viewport: { scrollAndZoomIntoView: vi.fn() },
      ui: { resize: vi.fn() },
      clientStorage: { setAsync: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should handle COPY_SELECTION', async () => {
    const msg: PluginMessage = { type: 'COPY_SELECTION' };
    await handleUIMessage(msg);
    expect(commands.handleCopyCommand).toHaveBeenCalledWith();
  });

  it('should handle PASTE_PROPERTY', async () => {
    const msg: PluginMessage = { type: 'PASTE_PROPERTY', granules: ['fills'] };
    await handleUIMessage(msg);
    expect(commands.handlePasteCommand).toHaveBeenCalledWith(['fills']);
  });

  it('should handle PASTE_PROPERTY with "all"', async () => {
    const msg: PluginMessage = { type: 'PASTE_PROPERTY', granules: ['all'] };
    await handleUIMessage(msg);
    expect(commands.handlePasteCommand).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should handle SELECT_NODE', async () => {
    const mockNode = { id: '123', type: 'RECTANGLE' };
    vi.mocked(figma.getNodeByIdAsync).mockResolvedValue(mockNode as any);

    const msg: PluginMessage = { type: 'SELECT_NODE', id: '123' };
    await handleUIMessage(msg);

    expect(figma.getNodeByIdAsync).toHaveBeenCalledWith('123');
    expect(figma.currentPage.selection).toEqual([mockNode]);
    expect(figma.viewport.scrollAndZoomIntoView).toHaveBeenCalledWith([
      mockNode,
    ]);
  });

  it('should not select anything if SELECT_NODE finds no node', async () => {
    vi.mocked(figma.getNodeByIdAsync).mockResolvedValue(null);

    const msg: PluginMessage = { type: 'SELECT_NODE', id: '999' };
    await handleUIMessage(msg);

    expect(figma.currentPage.selection).toEqual([]);
    expect(figma.viewport.scrollAndZoomIntoView).not.toHaveBeenCalled();
  });

  it('should handle RESIZE_UI', async () => {
    const msg: PluginMessage = { type: 'RESIZE_UI', width: 400, height: 500 };
    await handleUIMessage(msg);

    expect(figma.ui.resize).toHaveBeenCalledWith(400, 500);
  });

  it('should handle SAVE_UI_SIZE', async () => {
    const msg: PluginMessage = {
      type: 'SAVE_UI_SIZE',
      width: 400,
      height: 500,
    };
    await handleUIMessage(msg);

    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith(
      'plugin_window_size',
      { width: 400, height: 500 }
    );
  });
});
