import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { SolidPaint } from '../types';
import { extractProperties } from './extraction';

/**
 * Factory for creating mock SceneNode objects with geometry properties.
 */
function createMockNode(
  overrides: Partial<{
    fills: unknown[];
    strokes: unknown[];
    effects: unknown[];
    [key: string]: unknown;
  }> = {}
): SceneNode {
  return {
    fills: overrides.fills ?? [],
    strokes: overrides.strokes ?? [],
    effects: overrides.effects ?? [],
    ...overrides,
  } as unknown as SceneNode;
}

describe('Property Extraction', () => {
  const mixed = Symbol('mixed');

  beforeAll(() => {
    vi.stubGlobal('figma', {
      mixed,
      getStyleById: vi.fn(),
      getStyleByIdAsync: vi.fn(),
      variables: {
        getVariableById: vi.fn(),
        getVariableByIdAsync: vi.fn(),
      },
    });
  });

  it('should extract fills from a node', async () => {
    const mockNode = createMockNode({
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
    });

    const result = await extractProperties(mockNode, ['fills']);
    expect(result.fills).toEqual((mockNode as GeometryMixin).fills);
  });

  it('should extract fills with variable bindings', async () => {
    const mockNode = createMockNode({
      fills: [
        {
          type: 'SOLID',
          color: { r: 1, g: 0, b: 0 },
          boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'var-123' } },
        },
      ],
    });

    const result = await extractProperties(mockNode, ['fills']);
    expect((result.fills?.[0] as SolidPaint).boundVariables?.color).toEqual({
      type: 'VARIABLE_ALIAS',
      id: 'var-123',
    });
  });

  it('should extract strokes and effects', async () => {
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
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['strokes', 'effects']);
    expect(result.strokes).toEqual((mockNode as GeometryMixin).strokes);
    expect(result.effects).toEqual((mockNode as BlendMixin).effects);
  });

  it('should extract opacity and corner radius', async () => {
    const mockNode = {
      opacity: 0.5,
      cornerRadius: 8,
      fills: [],
      strokes: [],
      effects: [],
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, [
      'opacity',
      'cornerRadius',
    ]);
    expect(result.opacity).toBe(0.5);
    expect(result.cornerRadius).toBe(8);
  });

  it('should extract individual corner radii', async () => {
    const mockNode = {
      cornerRadius: mixed,
      topLeftRadius: 10,
      topRightRadius: 20,
      bottomLeftRadius: 0,
      bottomRightRadius: 5,
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, [
      'cornerRadius',
      'topLeftRadius',
      'topRightRadius',
      'bottomLeftRadius',
      'bottomRightRadius',
    ]);

    // cornerRadius is mixed, so it should be ignored in favor of individual radii
    expect(result.cornerRadius).toBeUndefined();
    expect(result.topLeftRadius).toBe(10);
    expect(result.topRightRadius).toBe(20);
    expect(result.bottomLeftRadius).toBe(0);
    expect(result.bottomRightRadius).toBe(5);
  });

  it('should extract visual and metadata properties', async () => {
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
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, [
      'rotation',
      'opacity',
      'blendMode',
      'exportSettings',
    ]);
    expect(result.rotation).toBe(45);
    expect(result.opacity).toBe(0.8);
    expect(result.blendMode).toBe('MULTIPLY');
    expect(result.exportSettings).toEqual(
      (mockNode as ExportMixin).exportSettings
    );
  });

  it('should extract position and layout grids', async () => {
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
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['x', 'y', 'layoutGrids']);
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
    expect(result.layoutGrids).toEqual((mockNode as FrameNode).layoutGrids);
  });

  it('should extract constraints', async () => {
    const mockNode = {
      constraints: { horizontal: 'STRETCH', vertical: 'CENTER' },
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['constraints']);
    expect(result.constraints).toEqual(
      (mockNode as ConstraintMixin).constraints
    );
  });

  it('should extract auto layout properties', async () => {
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
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, [
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

  it('should extract contextual sizing properties', async () => {
    const mockNode = {
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'HUG',
      layoutAlign: 'STRETCH',
      layoutGrow: 1,
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, [
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

  it('should extract text properties', async () => {
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
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, [
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

  it('should resolve dominant value for mixed properties (Text)', async () => {
    const mockNode = {
      type: 'TEXT',
      fontSize: mixed,
      getRangeFontSize: vi.fn().mockReturnValue(12),
      characters: 'Hello',
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['fontSize']);
    expect(result.fontSize).toBe(12);
  });

  it('should resolve textStyleId to textStyleName', async () => {
    const mockStyle = {
      id: 'style-123',
      name: 'Heading / H1',
      type: 'TEXT',
    };

    // Enhance the global stub with getStyleByIdAsync
    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleByIdAsync: vi.fn().mockImplementation((id) => {
        if (id === 'style-123') return Promise.resolve(mockStyle);
        return Promise.resolve(null);
      }),
    });

    const mockNode = {
      textStyleId: 'style-123',
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['textStyleId']);
    expect(result.textStyleId).toBe('style-123');
    expect(result.textStyleName).toBe('Heading / H1');
  });

  it('should resolve fillStyleId to fillStyleName', async () => {
    const mockStyle = {
      id: 'style-fill-1',
      name: 'Brand / Primary',
      type: 'PAINT',
    };

    // Resetting/Updating the mock for this test case
    const getStyleByIdAsync = vi.fn().mockImplementation((id) => {
      if (id === 'style-fill-1') return Promise.resolve(mockStyle);
      return Promise.resolve(null);
    });
    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleByIdAsync,
      variables: {
        getVariableById: vi.fn(),
        getVariableByIdAsync: vi.fn(),
      },
    });

    const mockNode = {
      fillStyleId: 'style-fill-1',
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['fillStyleId']);
    expect(result.fillStyleId).toBe('style-fill-1');
    expect(result.fillStyleName).toBe('Brand / Primary');
  });

  it('should resolve fill variable bindings to paint.variableName', async () => {
    const mockVariable = {
      id: 'var-fill-1',
      name: 'Color/Primary',
      resolveForConsumer: vi
        .fn()
        .mockReturnValue({ value: { r: 1, g: 0, b: 0 } }),
    };

    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleById: vi.fn(),
      variables: {
        getVariableById: vi.fn(),
        getVariableByIdAsync: vi.fn().mockImplementation((id) => {
          if (id === 'var-fill-1') return Promise.resolve(mockVariable);
          return Promise.resolve(null);
        }),
      },
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
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['fills']);
    expect(result.fills).toHaveLength(1);
    expect(result.fillMetadata?.[0]).toHaveProperty(
      'variableName',
      'Color/Primary'
    );
  });

  it('should gracefuly handle unresolved variables', async () => {
    // Setup mock with variable alias but fail to resolve it
    const mockNode = {
      fills: [
        {
          type: 'SOLID',
          color: { r: 1, g: 0, b: 0 },
          boundVariables: {
            color: { type: 'VARIABLE_ALIAS', id: 'var:123' },
          },
        },
      ],
    } as unknown as SceneNode;

    figma.variables.getVariableByIdAsync = vi.fn().mockResolvedValue(null); // Return null

    const result = await extractProperties(mockNode, ['fills']);

    expect(result.fills).toHaveLength(1);
    expect(result.fillMetadata).toBeUndefined();
  });

  it('should resolve strokeStyleId to strokeStyleName', async () => {
    const mockStyle = {
      id: 'style-stroke-1',
      name: 'Stroke / Secondary',
      type: 'PAINT',
    };

    const getStyleByIdAsync = vi.fn().mockImplementation((id) => {
      if (id === 'style-stroke-1') return Promise.resolve(mockStyle);
      return Promise.resolve(null);
    });
    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleByIdAsync,
      variables: {
        getVariableById: vi.fn(),
        getVariableByIdAsync: vi.fn(),
      },
    });

    const mockNode = {
      strokeStyleId: 'style-stroke-1',
    } as unknown as SceneNode;
    const result = await extractProperties(mockNode, ['strokeStyleId']);
    expect(result.strokeStyleId).toBe('style-stroke-1');
    expect(result.strokeStyleName).toBe('Stroke / Secondary');
  });

  it('should resolve stroke variable bindings to paint.variableName via sidecar', async () => {
    const mockVariable = {
      id: 'var-stroke-1',
      name: 'Color/Secondary',
      resolveForConsumer: vi
        .fn()
        .mockReturnValue({ value: { r: 0, g: 1, b: 0 } }),
    };

    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleById: vi.fn(),
      variables: {
        getVariableById: vi.fn(),
        getVariableByIdAsync: vi.fn().mockImplementation((id) => {
          if (id === 'var-stroke-1') return Promise.resolve(mockVariable);
          return Promise.resolve(null);
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
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['strokes']);
    expect(result.strokeMetadata?.[0]).toHaveProperty(
      'variableName',
      'Color/Secondary'
    );
  });

  it('should resolve effectStyleId to effectStyleName', async () => {
    const mockStyle = {
      id: 'style-effect-1',
      name: 'Shadow / Elevation 1',
      type: 'EFFECT',
    };

    // Enhance the global stub with getStyleByIdAsync
    vi.stubGlobal('figma', {
      mixed: Symbol('mixed'),
      getStyleByIdAsync: vi.fn().mockImplementation((id) => {
        if (id === 'style-effect-1') return Promise.resolve(mockStyle);
        return Promise.resolve(null);
      }),
      variables: {
        getVariableById: vi.fn(),
        getVariableByIdAsync: vi.fn(),
      },
    });

    const mockNode = {
      effectStyleId: 'style-effect-1',
    } as unknown as SceneNode;
    const result = await extractProperties(mockNode, ['effectStyleId']);
    expect(result.effectStyleId).toBe('style-effect-1');
    expect(result.effectStyleName).toBe('Shadow / Elevation 1');
  });

  it('should resolve paragraph properties', async () => {
    const mixed = figma.mixed;
    const mockNode = {
      type: 'TEXT',
      paragraphSpacing: mixed,
      paragraphIndent: mixed,
      listSpacing: mixed,
      getRangeParagraphSpacing: vi.fn().mockReturnValue(10),
      getRangeParagraphIndent: vi.fn().mockReturnValue(20),
      getRangeListSpacing: vi.fn().mockReturnValue(30),
      characters: 'Text',
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, [
      'paragraphSpacing',
      'paragraphIndent',
      'listSpacing',
    ]);
    expect(result.paragraphSpacing).toBe(10);
    expect(result.paragraphIndent).toBe(20);
    expect(result.listSpacing).toBe(30);
  });

  it('should extract advanced stroke properties', async () => {
    const mockNode = {
      strokeWeight: 2,
      strokeAlign: 'INSIDE',
      dashPattern: [4, 4],
      strokeCap: 'ROUND',
      strokeJoin: 'BEVEL',
      strokeMiterLimit: 10,
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, [
      'strokeWeight',
      'strokeAlign',
      'dashPattern',
      'strokeCap',
      'strokeJoin',
      'strokeMiterLimit',
    ]);

    expect(result.strokeWeight).toBe(2);
    expect(result.strokeAlign).toBe('INSIDE');
    expect(result.dashPattern).toEqual([4, 4]);
    expect(result.strokeCap).toBe('ROUND');
    expect(result.strokeJoin).toBe('BEVEL');
    expect(result.strokeMiterLimit).toBe(10);
  });

  it('should extract dimensions', async () => {
    const mockNode = {
      width: 100,
      height: 200,
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['width', 'height']);

    expect(result.width).toBe(100);
    expect(result.height).toBe(200);
  });

  it('should ignore mixed cornerRadius on RectangleCornerMixin nodes', async () => {
    const mixed = figma.mixed;
    const mockNode = {
      type: 'RECTANGLE',
      cornerRadius: mixed,
      topLeftRadius: 10,
      topRightRadius: 20,
      bottomLeftRadius: 10,
      bottomRightRadius: 20,
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, [
      'cornerRadius',
      'topLeftRadius',
      'topRightRadius',
      'bottomLeftRadius',
      'bottomRightRadius',
    ]);

    // cornerRadius should be ignored/undefined because it is mixed on a Rectangle
    expect(result).not.toHaveProperty('cornerRadius');
    // Individual radii should be present
    expect(result.topLeftRadius).toBe(10);
    expect(result.topRightRadius).toBe(20);
  });

  it('should resolve mixed cornerRadius to first vertex for VectorNode', async () => {
    const mixed = figma.mixed;
    const mockNode = {
      type: 'VECTOR',
      cornerRadius: mixed,
      vectorNetwork: {
        vertices: [{ cornerRadius: 5 }, { cornerRadius: 10 }],
      },
    } as unknown as SceneNode;

    const result = await extractProperties(mockNode, ['cornerRadius']);

    // Should resolve to the first vertex's cornerRadius
    expect(result.cornerRadius).toBe(5);
  });
});
