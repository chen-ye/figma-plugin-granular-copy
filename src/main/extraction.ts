import type { ExtendedPaint, ExtractionResult } from '../types';

/**
 * Extracts specific properties from a Figma node.
 * Handles granules like 'fills', 'strokes', and 'effects'.
 */
export async function extractProperties(
  node: SceneNode,
  granules: string[]
): Promise<ExtractionResult> {
  const result: ExtractionResult = {};
  const tasks: Promise<void>[] = [];

  for (const granule of granules) {
    if (granule in node) {
      // Dynamic access is required here since granules are runtime strings.
      // The 'in' check above guarantees the property exists on the node.
      let value = (node as unknown as Record<string, unknown>)[granule];

      if (value === figma.mixed) {
        value = resolveMixedValue(node, granule);
      }

      // If value is still mixed after attempted resolution, we skip it
      // to avoid serializing Symbols which causes storage errors.
      if (value === figma.mixed) {
        continue;
      }

      result[granule] = value;

      // Enrich with style names using mapping
      enrichStyleName(granule, value, result, tasks);

      // Enrich with variable names for paints
      if (
        (granule === 'fills' || granule === 'strokes') &&
        Array.isArray(value) &&
        value.length > 0
      ) {
        enrichPaintVariables(granule, value, result, tasks);
      }
    }
  }

  await Promise.all(tasks);

  return result;
}

function resolveMixedValue(node: SceneNode, granule: string): unknown {
  if (node.type === 'TEXT') {
    // Use the first character's style as the "dominant" one
    // We check if characters exist to avoid errors, though usually a node exists
    if (node.characters.length === 0) return figma.mixed;

    switch (granule) {
      case 'fontSize':
        return node.getRangeFontSize(0, 1);
      case 'fontName':
        return node.getRangeFontName(0, 1);
      case 'lineHeight':
        return node.getRangeLineHeight(0, 1);
      case 'letterSpacing':
        return node.getRangeLetterSpacing(0, 1);
      case 'textDecoration':
        return node.getRangeTextDecoration(0, 1);
      case 'textCase':
        return node.getRangeTextCase(0, 1);
      case 'fills':
        return node.getRangeFills(0, 1);
      case 'textStyleId':
        return node.getRangeTextStyleId(0, 1);
      case 'fillStyleId':
        return node.getRangeFillStyleId(0, 1);
      case 'paragraphSpacing':
        return node.getRangeParagraphSpacing(0, 1);
      case 'paragraphIndent':
        return node.getRangeParagraphIndent(0, 1);
      case 'listSpacing':
        return node.getRangeListSpacing(0, 1);
    }
  }

  if (granule === 'cornerRadius' && 'topLeftRadius' in node) {
    // Type narrowing: 'topLeftRadius' is on RectangleCornerMixin
    return (node as RectangleCornerMixin).topLeftRadius;
  }

  return figma.mixed;
}

// Helper: Map style ID granules to their name result keys
const STYLE_NAME_MAP: Partial<Record<string, keyof ExtractionResult>> = {
  textStyleId: 'textStyleName',
  fillStyleId: 'fillStyleName',
  strokeStyleId: 'strokeStyleName',
  effectStyleId: 'effectStyleName',
};

/**
 * Enriches the result with style names for style ID properties.
 */
function enrichStyleName(
  granule: string,
  value: unknown,
  result: ExtractionResult,
  tasks: Promise<void>[]
): void {
  const nameKey = STYLE_NAME_MAP[granule];
  if (nameKey && typeof value === 'string') {
    tasks.push(
      (async () => {
        const style = await figma.getStyleByIdAsync(value);
        if (style) {
          result[nameKey] = style.name;
        }
      })()
    );
  }
}

/**
 * Enriches paint arrays with variable names for bound color variables.
 */
function enrichPaintVariables(
  granule: 'fills' | 'strokes',
  value: unknown[],
  result: ExtractionResult,
  tasks: Promise<void>[]
): void {
  // Clone paints for mutation (adding variableName)
  const paints = JSON.parse(JSON.stringify(value)) as ExtendedPaint[];
  let hasUpdates = false;

  const paintTasks = paints.map(async (paint) => {
    if (paint.boundVariables?.color?.type === 'VARIABLE_ALIAS') {
      const variableId = paint.boundVariables.color.id;
      try {
        const variable = await figma.variables.getVariableByIdAsync(variableId);
        if (variable) {
          paint.variableName = variable.name;
          hasUpdates = true;
        }
      } catch (e) {
        console.warn(`Failed to resolve variable ${variableId}`, e);
      }
    }
  });

  tasks.push(
    (async () => {
      await Promise.all(paintTasks);
      if (hasUpdates) {
        result[granule] = paints;
      }
    })()
  );
}
