import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveProperties, loadProperties } from './storage';

describe('Storage Service', () => {
  beforeEach(() => {
    vi.stubGlobal('figma', {
      clientStorage: {
        getAsync: vi.fn(),
        setAsync: vi.fn(),
      },
    });
  });

  it('should save properties to figma.clientStorage', async () => {
    const data = { fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] };
    await saveProperties(data);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('granular_copy_data', data);
  });

  it('should load properties from figma.clientStorage', async () => {
    const data = { fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] };
    (figma.clientStorage.getAsync as any).mockResolvedValue(data);
    const result = await loadProperties();
    expect(result).toEqual(data);
    expect(figma.clientStorage.getAsync).toHaveBeenCalledWith('granular_copy_data');
  });

  it('should handle errors during save', async () => {
    const data = { fills: [] };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (figma.clientStorage.setAsync as any).mockRejectedValue(new Error('Save failed'));
    
    await saveProperties(data);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to save properties to clientStorage:', expect.any(Error));
  });

  it('should handle errors during load', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (figma.clientStorage.getAsync as any).mockRejectedValue(new Error('Load failed'));
    
    const result = await loadProperties();
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load properties from clientStorage:', expect.any(Error));
  });
});

