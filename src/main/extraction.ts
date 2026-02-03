import type { ExtractionResult } from '../types';

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
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic property access
      let value = (node as any)[granule];

      if (value === figma.mixed) {
        value = resolveMixedValue(node, granule);
      }

      // If value is still mixed after attempted resolution, we skip it
      // to avoid serializing Symbols which causes storage errors.
      if (value === figma.mixed) {
        continue;
      }

      result[granule] = value;

      // Enrich with style names
      if (granule === 'textStyleId' && typeof value === 'string') {
        tasks.push(
          (async () => {
            const style = await figma.getStyleByIdAsync(value);
            if (style) {
              result.textStyleName = style.name;
            }
          })()
        );
      }

      if (granule === 'fillStyleId' && typeof value === 'string') {
        tasks.push(
          (async () => {
            const style = await figma.getStyleByIdAsync(value);
            if (style) {
              result.fillStyleName = style.name;
            }
          })()
        );
      }

      if (granule === 'strokeStyleId' && typeof value === 'string') {
        tasks.push(
          (async () => {
            const style = await figma.getStyleByIdAsync(value);
            if (style) {
              result.strokeStyleName = style.name;
            }
          })()
        );
      }

      if (granule === 'effectStyleId' && typeof value === 'string') {
        tasks.push(
          (async () => {
            const style = await figma.getStyleByIdAsync(value);
            if (style) {
              result.effectStyleName = style.name;
            }
          })()
        );
      }

      // Enrich with variable names for Fills
      if (granule === 'fills' && Array.isArray(value) && value.length > 0) {
        // biome-ignore lint/suspicious/noExplicitAny: cloning for mutation
        const paints = JSON.parse(JSON.stringify(value)) as any[];

        let hasUpdates = false;

        const paintTasks = paints.map(async (paint: any) => {
          if (paint.boundVariables?.color?.type === 'VARIABLE_ALIAS') {
            const variableId = paint.boundVariables.color.id;
            try {
              const variable =
                await figma.variables.getVariableByIdAsync(variableId);
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

      // Enrich with variable names for Strokes
      if (granule === 'strokes' && Array.isArray(value) && value.length > 0) {
        // biome-ignore lint/suspicious/noExplicitAny: cloning for mutation
        const paints = JSON.parse(JSON.stringify(value)) as any[];

        let hasUpdates = false;

        const paintTasks = paints.map(async (paint: any) => {
          if (paint.boundVariables?.color?.type === 'VARIABLE_ALIAS') {
            const variableId = paint.boundVariables.color.id;
            try {
              const variable =
                await figma.variables.getVariableByIdAsync(variableId);
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
    // biome-ignore lint/suspicious/noExplicitAny: Check existence first
    return (node as any).topLeftRadius;
  }

  return figma.mixed;
}
