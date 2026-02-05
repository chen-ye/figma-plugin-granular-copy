import { describe, expect, it, vi, beforeEach } from 'vitest';
import { extractProperties } from './extraction';

describe('extractProperties', () => {
  beforeEach(() => {
    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleByIdAsync: vi.fn(),
      variables: {
        getVariableByIdAsync: vi.fn(),
      },
    });
  });

  it('should extract simple properties', async () => {
    const node = { opacity: 0.5, name: 'Test' } as any;
    const result = await extractProperties(node, ['opacity', 'name' as any]);
    expect(result).toEqual({ opacity: 0.5, name: 'Test' });
  });

  it('should handle missing properties', async () => {
    const node = { opacity: 0.5 } as any;
    const result = await extractProperties(node, ['opacity', 'nonexistent' as any]);
    expect(result).toEqual({ opacity: 0.5 });
  });

  it('should handle figma.mixed for simple properties by resolving to empty', async () => {
    const node = { opacity: figma.mixed } as any;
    const result = await extractProperties(node, ['opacity']);
    expect(result).toEqual({});
  });

  it('should resolve various mixed text properties', async () => {
    const mixedTextNode = {
      type: 'TEXT',
      characters: 'Mixed',
      fontSize: figma.mixed,
      fontName: figma.mixed,
      lineHeight: figma.mixed,
      getRangeFontSize: vi.fn().mockReturnValue(12),
      getRangeFontName: vi.fn().mockReturnValue({ family: 'Inter', style: 'Regular' }),
      getRangeLineHeight: vi.fn().mockReturnValue({ value: 14, unit: 'PIXELS' }),
    } as any;
    
    expect(await extractProperties(mixedTextNode, ['fontSize'])).toEqual({ fontSize: 12 });
    expect(await extractProperties(mixedTextNode, ['fontName'])).toEqual({ fontName: { family: 'Inter', style: 'Regular' } });
    expect(await extractProperties(mixedTextNode, ['lineHeight'])).toEqual({ lineHeight: { value: 14, unit: 'PIXELS' } });
  });

  it('should handle corner radius on vector nodes', async () => {
    const vectorNode = {
      type: 'VECTOR',
      cornerRadius: figma.mixed,
      vectorNetwork: {
        vertices: [{ cornerRadius: 4 }]
      }
    } as any;
    expect(await extractProperties(vectorNode, ['cornerRadius'])).toEqual({ cornerRadius: 4 });
  });

  it('should return empty for empty vector network', async () => {
    const vectorNode = {
      type: 'VECTOR',
      cornerRadius: figma.mixed,
      vectorNetwork: { vertices: [] }
    } as any;
    expect(await extractProperties(vectorNode, ['cornerRadius'])).toEqual({});
  });

  it('should handle style names', async () => {
    const node = { textStyleId: 'S:123' } as any;
    vi.mocked(figma.getStyleByIdAsync).mockResolvedValue({ name: 'Heading 1' } as any);
    
    const result = await extractProperties(node, ['textStyleId']);
    expect(result).toEqual({ textStyleId: 'S:123', textStyleName: 'Heading 1' });
  });

  it('should handle variable-bound paints', async () => {
    const node = {
      fills: [
        {
          type: 'SOLID',
          color: { r: 1, g: 0, b: 0 },
          boundVariables: {
            color: { type: 'VARIABLE_ALIAS', id: 'V:1' }
          }
        }
      ]
    } as any;
    
    vi.mocked(figma.variables.getVariableByIdAsync).mockResolvedValue({ name: 'Brand/Red' } as any);
    
    const result = await extractProperties(node, ['fills']);
    expect(result.fillMetadata).toEqual({
      0: { variableName: 'Brand/Red' }
    });
  });

  it('should handle variable resolution failure', async () => {
    const node = {
      fills: [
        {
          type: 'SOLID',
          color: { r: 1, g: 0, b: 0 },
          boundVariables: {
            color: { type: 'VARIABLE_ALIAS', id: 'V:1' }
          }
        }
      ]
    } as any;
    
    vi.mocked(figma.variables.getVariableByIdAsync).mockRejectedValue(new Error('Var fail'));
    
    const result = await extractProperties(node, ['fills']);
    expect(result.fillMetadata).toBeUndefined();
  });
});