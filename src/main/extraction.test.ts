import { describe, it, expect, vi } from 'vitest';
import { extractProperties } from './extraction';

describe('Property Extraction', () => {
  it('should extract fills from a node', () => {
    const mockNode = {
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
      strokes: [],
      effects: [],
    } as any;

    const result = extractProperties(mockNode, ['fills']);
    expect(result.fills).toEqual(mockNode.fills);
  });

  it('should extract fills with variable bindings', () => {
    const mockNode = {
      fills: [{ 
        type: 'SOLID', 
        color: { r: 1, g: 0, b: 0 },
        boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'var-123' } }
      }],
      strokes: [],
      effects: [],
    } as any;

    const result = extractProperties(mockNode, ['fills']);
    expect(result.fills?.[0].boundVariables?.color).toEqual({ type: 'VARIABLE_ALIAS', id: 'var-123' });
  });

  it('should extract strokes and effects', () => {
    const mockNode = {
      fills: [],
      strokes: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }],
      effects: [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.5 }, offset: { x: 0, y: 4 }, radius: 4, visible: true }],
    } as any;

    const result = extractProperties(mockNode, ['strokes', 'effects']);
    expect(result.strokes).toEqual(mockNode.strokes);
    expect(result.effects).toEqual(mockNode.effects);
  });

  it('should extract opacity and corner radius', () => {
    const mockNode = {
      opacity: 0.5,
      cornerRadius: 8,
      fills: [],
      strokes: [],
      effects: [],
    } as any;

    const result = extractProperties(mockNode, ['opacity', 'cornerRadius']);
    expect(result.opacity).toBe(0.5);
    expect(result.cornerRadius).toBe(8);
  });

  it('should extract individual corner radii', () => {
    const mixed = Symbol('mixed');
    vi.stubGlobal('figma', { mixed });

    const mockNode = {
      cornerRadius: mixed,
      topLeftRadius: 10,
      topRightRadius: 20,
      bottomLeftRadius: 0,
      bottomRightRadius: 5,
    } as any;

    const result = extractProperties(mockNode, [
      'cornerRadius',
      'topLeftRadius',
      'topRightRadius',
      'bottomLeftRadius',
      'bottomRightRadius'
    ]);
    
    expect(result.cornerRadius).toBe(mixed);
    expect(result.topLeftRadius).toBe(10);
    expect(result.topRightRadius).toBe(20);
    expect(result.bottomLeftRadius).toBe(0);
    expect(result.bottomRightRadius).toBe(5);
  });

  it('should extract visual and metadata properties', () => {
    const mockNode = {
      rotation: 45,
      opacity: 0.8,
      blendMode: 'MULTIPLY',
      exportSettings: [{ format: 'PNG', suffix: '@2x', constraint: { type: 'SCALE', value: 2 } }],
    } as any;

    const result = extractProperties(mockNode, ['rotation', 'opacity', 'blendMode', 'exportSettings']);
    expect(result.rotation).toBe(45);
    expect(result.opacity).toBe(0.8);
    expect(result.blendMode).toBe('MULTIPLY');
    expect(result.exportSettings).toEqual(mockNode.exportSettings);
  });

  it('should extract position and layout grids', () => {
    const mockNode = {
      x: 100,
      y: 200,
      layoutGrids: [{ pattern: 'COLUMNS', sectionSize: 20, visible: true, color: { r: 1, g: 0, b: 0, a: 0.1 }, alignment: 'STRETCH', count: 12, gutterSize: 20, offset: 0 }],
    } as any;

    const result = extractProperties(mockNode, ['x', 'y', 'layoutGrids']);
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
    expect(result.layoutGrids).toEqual(mockNode.layoutGrids);
  });

  it('should extract constraints', () => {
    const mockNode = {
      constraints: { horizontal: 'STRETCH', vertical: 'CENTER' },
    } as any;

    const result = extractProperties(mockNode, ['constraints']);
    expect(result.constraints).toEqual(mockNode.constraints);
  });
});




