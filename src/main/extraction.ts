import type { ExtractionResult, Granule, Paint, PaintMetadata } from '../types';

type Extractor = (
  node: SceneNode,
  granule: Granule
) => Promise<[string, unknown][]>;

/**
 * Extracts specific properties from a Figma node.
 * Handles granules like 'fills', 'strokes', and 'effects' using a strategy pattern.
 */
export async function extractProperties(
  node: SceneNode,
  granules: readonly Granule[]
): Promise<ExtractionResult> {
  const entriesPromises = granules.map(async (granule) => {
    const extractor = EXTRACTORS[granule] || defaultExtractor;
    return extractor(node, granule);
  });

  const entriesArrays = await Promise.all(entriesPromises);
  return Object.fromEntries(entriesArrays.flat());
}

/**
 * Default extractor: handles simple property access and basic mixed resolution.
 */
const defaultExtractor: Extractor = async (node, granule) => {
  if (!(granule in node)) return [];

  let value = (node as unknown as Record<string, unknown>)[granule];

  if (value === figma.mixed) {
    value = resolveMixedValue(node, granule);
    if (value === figma.mixed) return [];
  }

  return [[granule, value]];
};

/**
 * Paints extractor: handles fills/strokes and resolves variable aliases.
 */
const paintsExtractor: Extractor = async (node, granule) => {
  const valueEntries = await defaultExtractor(node, granule);
  if (valueEntries.length === 0) return [];

  const [_key, value] = valueEntries[0];
  const metadataEntry = await resolvePaintMetadataEntry(
    granule as 'fills' | 'strokes',
    value as Paint[]
  );

  return metadataEntry ? [valueEntries[0], metadataEntry] : valueEntries;
};

/**
 * Style ID extractor: handles style IDs and resolves their names.
 */
const styleIdExtractor: Extractor = async (node, granule) => {
  const valueEntries = await defaultExtractor(node, granule);
  if (valueEntries.length === 0) return [];

  const [_key, value] = valueEntries[0];
  const nameEntry = await resolveStyleNameEntry(granule, value);

  return nameEntry ? [valueEntries[0], nameEntry] : valueEntries;
};

const EXTRACTORS: Partial<Record<Granule, Extractor>> = {
  fills: paintsExtractor,
  strokes: paintsExtractor,
  textStyleId: styleIdExtractor,
  fillStyleId: styleIdExtractor,
  strokeStyleId: styleIdExtractor,
  effectStyleId: styleIdExtractor,
};

function resolveMixedValue(node: SceneNode, granule: string): unknown {
  if (node.type === 'TEXT') {
    // We check if characters exist to avoid errors, though usually a node exists
    if (node.characters.length === 0) return figma.mixed;

    // Use the first character's style as the "dominant" one
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

  if (granule === 'cornerRadius') {
    if (node.type === 'VECTOR') {
      return node.vectorNetwork.vertices[0]?.cornerRadius;
    }
    if ('topLeftRadius' in node) {
      // Type narrowing: 'topLeftRadius' is on RectangleCornerMixin
      // Explicitly return figma.mixed to signal "do not extract this property"
      // The individual radii (topLeftRadius, etc.) will be extracted separately
      return figma.mixed;
    }
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
 * Resolves style names for style ID properties, returning an entry [key, value].
 */
async function resolveStyleNameEntry(
  granule: string,
  value: unknown
): Promise<[string, unknown] | null> {
  const nameKey = STYLE_NAME_MAP[granule];
  if (nameKey && typeof value === 'string') {
    const style = await figma.getStyleByIdAsync(value);
    return style ? [nameKey as string, style.name] : null;
  }
  return null;
}

/**
 * Resolves variable names for bound color variables in paints, returning an entry [key, value].
 */
async function resolvePaintMetadataEntry(
  granule: 'fills' | 'strokes',
  paints: Paint[]
): Promise<[string, unknown] | null> {
  const metadata: Record<number, PaintMetadata> = {};
  let hasUpdates = false;

  await Promise.all(
    paints.map(async (paint, index) => {
      if (
        paint.type === 'SOLID' &&
        paint.boundVariables?.color?.type === 'VARIABLE_ALIAS'
      ) {
        const variableId = paint.boundVariables.color.id;
        try {
          const variable =
            await figma.variables.getVariableByIdAsync(variableId);
          if (variable) {
            metadata[index] = { variableName: variable.name };
            hasUpdates = true;
          }
        } catch (e) {
          console.warn(`Failed to resolve variable ${variableId}`, e);
        }
      }
    })
  );

  if (!hasUpdates) return null;

  return granule === 'fills'
    ? ['fillMetadata', metadata]
    : ['strokeMetadata', metadata];
}
