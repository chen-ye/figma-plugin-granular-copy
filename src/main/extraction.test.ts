import { describe, it, expect, vi, beforeAll } from 'vitest';
import { extractProperties } from './extraction';

describe('Property Extraction', () => {
  const mixed = Symbol('mixed');

  beforeAll(() => {
    vi.stubGlobal('figma', {
      mixed,
      getStyleById: vi.fn(),
      variables: {
        getVariableById: vi.fn(),
      },
    });
  });

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
      fills: [
        {
          type: 'SOLID',
          color: { r: 1, g: 0, b: 0 },
          boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'var-123' } },
        },
      ],
      strokes: [],
      effects: [],
    } as any;

    const result = extractProperties(mockNode, ['fills']);
    expect(result.fills?.[0].boundVariables?.color).toEqual({
      type: 'VARIABLE_ALIAS',
      id: 'var-123',
    });
  });

  it('should extract strokes and effects', () => {
    const mockNode = {
      fills: [],
      strokes: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }],
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.5 },
          offset: { x: 0, y: 4 },
          radius: 4,
          visible: true,
        },
      ],
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
      'bottomRightRadius',
    ]);

    // cornerRadius is mixed, so it should be resolved to topLeftRadius (10)
    expect(result.cornerRadius).toBe(10);
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
      exportSettings: [
        {
          format: 'PNG',
          suffix: '@2x',
          constraint: { type: 'SCALE', value: 2 },
        },
      ],
    } as any;

    const result = extractProperties(mockNode, [
      'rotation',
      'opacity',
      'blendMode',
      'exportSettings',
    ]);
    expect(result.rotation).toBe(45);
    expect(result.opacity).toBe(0.8);
    expect(result.blendMode).toBe('MULTIPLY');
    expect(result.exportSettings).toEqual(mockNode.exportSettings);
  });

  it('should extract position and layout grids', () => {
    const mockNode = {
      x: 100,
      y: 200,
      layoutGrids: [
        {
          pattern: 'COLUMNS',
          sectionSize: 20,
          visible: true,
          color: { r: 1, g: 0, b: 0, a: 0.1 },
          alignment: 'STRETCH',
          count: 12,
          gutterSize: 20,
          offset: 0,
        },
      ],
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

  it('should extract auto layout properties', () => {
    const mockNode = {
      layoutMode: 'HORIZONTAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'BASELINE',
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 20,
      paddingBottom: 20,
      itemSpacing: 8,
      layoutWrap: 'NO_WRAP',
    } as any;

    const result = extractProperties(mockNode, [
      'layoutMode',
      'primaryAxisAlignItems',
      'counterAxisAlignItems',
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
      'itemSpacing',
      'layoutWrap',
    ]);

    expect(result.layoutMode).toBe('HORIZONTAL');
    expect(result.paddingLeft).toBe(10);
    expect(result.itemSpacing).toBe(8);
    expect(result.layoutWrap).toBe('NO_WRAP');
  });

  it('should extract contextual sizing properties', () => {
    const mockNode = {
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'HUG',
      layoutAlign: 'STRETCH',
      layoutGrow: 1,
    } as any;

    const result = extractProperties(mockNode, [
      'primaryAxisSizingMode',
      'counterAxisSizingMode',
      'layoutAlign',
      'layoutGrow',
    ]);

    expect(result.primaryAxisSizingMode).toBe('FIXED');
    expect(result.counterAxisSizingMode).toBe('HUG');
    expect(result.layoutAlign).toBe('STRETCH');
    expect(result.layoutGrow).toBe(1);
  });

  it('should extract text properties', () => {
    const mockNode = {
      characters: 'Hello World',
      textStyleId: 'style-123',
      fontName: { family: 'Inter', style: 'Regular' },
      fontSize: 16,
      lineHeight: { value: 24, unit: 'PIXELS' },
      letterSpacing: { value: 0, unit: 'PERCENT' },
      paragraphSpacing: 0,
      paragraphIndent: 0,
      textCase: 'ORIGINAL',
      textDecoration: 'NONE',
    } as any;

    const result = extractProperties(mockNode, [
      'characters',
      'textStyleId',
      'fontName',
      'fontSize',
      'lineHeight',
      'letterSpacing',
      'paragraphSpacing',
      'paragraphIndent',
      'textCase',
      'textDecoration',
    ]);

    expect(result.characters).toBe('Hello World');
    expect(result.textStyleId).toBe('style-123');
    expect(result.fontSize).toBe(16);
  });

  it('should resolve dominant value for mixed properties (Text)', () => {
    const mockNode = {
      type: 'TEXT',
      fontSize: mixed,
      getRangeFontSize: vi.fn().mockReturnValue(12),
      characters: 'Hello',
    } as any;

    const result = extractProperties(mockNode, ['fontSize']);
    expect(result.fontSize).toBe(12);
  });

  it('should resolve textStyleId to textStyleName', () => {
    const mockStyle = {
      id: 'style-123',
      name: 'Heading / H1',
      type: 'TEXT',
    };

    // Enhance the global stub with getStyleById
    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleById: vi.fn().mockImplementation((id) => {
        if (id === 'style-123') return mockStyle;
        return null;
      }),
    });

    const mockNode = {
      textStyleId: 'style-123',
    } as any;

    const result = extractProperties(mockNode, ['textStyleId']);
    expect(result.textStyleId).toBe('style-123');
    expect(result.textStyleName).toBe('Heading / H1');
  });

  it('should resolve fillStyleId to fillStyleName', () => {
    const mockStyle = {
      id: 'style-fill-1',
      name: 'Brand / Primary',
      type: 'PAINT',
    };

    // Global stub is already set up in beforeAll, we just need to update the mock implementation
    // if we want to be strict, or just rely on the mock we added in the previous test.
    // Let's make the mock more robust in the test itself or rely on the previous one?
    // The previous test set a specific implementation. Let's update it.
    
    // Resetting/Updating the mock for this test case
    const getStyleById = vi.fn().mockImplementation((id) => {
      if (id === 'style-fill-1') return mockStyle;
      return null;
    });
    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleById,
      variables: {
        getVariableById: vi.fn(),
      }
    });

    const mockNode = {
      fillStyleId: 'style-fill-1',
    } as any;

    const result = extractProperties(mockNode, ['fillStyleId']);
    expect(result.fillStyleId).toBe('style-fill-1');
    expect(result.fillStyleName).toBe('Brand / Primary');
  });

  it('should resolve fill variable bindings to fillVariableName', () => {
    const mockVariable = {
      id: 'var-fill-1',
      name: 'Color/Primary',
      resolveForConsumer: vi.fn().mockReturnValue({ value: { r: 1, g: 0, b: 0 } }),
    };

    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleById: vi.fn(),
      variables: {
        getVariableById: vi.fn().mockImplementation((id) => {
          if (id === 'var-fill-1') return mockVariable;
          return null;
        }),
      }
    });

    const mockNode = {
      fills: [
        {
          type: 'SOLID',
          boundVariables: {
            color: { type: 'VARIABLE_ALIAS', id: 'var-fill-1' },
          },
        },
      ],
    } as any;

    const result = extractProperties(mockNode, ['fills']);
    expect(result.fillVariableName).toBe('Color/Primary');
  });

  it('should resolve strokeStyleId to strokeStyleName', () => {
    const mockStyle = {
      id: 'style-stroke-1',
      name: 'Stroke / Secondary',
      type: 'PAINT',
    };

    const getStyleById = vi.fn().mockImplementation((id) => {
      if (id === 'style-stroke-1') return mockStyle;
      return null;
    });
    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleById,
      variables: { getVariableById: vi.fn() },
    });

    const mockNode = { strokeStyleId: 'style-stroke-1' } as any;
    const result = extractProperties(mockNode, ['strokeStyleId']);
    expect(result.strokeStyleId).toBe('style-stroke-1');
    expect(result.strokeStyleName).toBe('Stroke / Secondary');
  });

  it('should resolve stroke variable bindings to strokeVariableName', () => {
    const mockVariable = {
      id: 'var-stroke-1',
      name: 'Color/Secondary',
      resolveForConsumer: vi.fn().mockReturnValue({ value: { r: 0, g: 1, b: 0 } }),
    };

    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleById: vi.fn(),
      variables: {
        getVariableById: vi.fn().mockImplementation((id) => {
          if (id === 'var-stroke-1') return mockVariable;
          return null;
        }),
      },
    });

    const mockNode = {
      strokes: [
        {
          type: 'SOLID',
          boundVariables: {
            color: { type: 'VARIABLE_ALIAS', id: 'var-stroke-1' },
          },
        },
      ],
    } as any;

    const result = extractProperties(mockNode, ['strokes']);
    expect(result.strokeVariableName).toBe('Color/Secondary');
  });

  it('should resolve effectStyleId to effectStyleName', () => {
    const mockStyle = {
      id: 'style-effect-1',
      name: 'Shadow / Elevation 1',
      type: 'EFFECT',
    };

    const getStyleById = vi.fn().mockImplementation((id) => {
      if (id === 'style-effect-1') return mockStyle;
      return null;
    });
    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleById,
      variables: { getVariableById: vi.fn() },
    });

    const mockNode = { effectStyleId: 'style-effect-1' } as any;
    const result = extractProperties(mockNode, ['effectStyleId']);
    expect(result.effectStyleId).toBe('style-effect-1');
    expect(result.effectStyleName).toBe('Shadow / Elevation 1');
  });
});
