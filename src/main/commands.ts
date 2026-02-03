import { extractProperties } from './extraction';
import { loadProperties, saveProperties } from './storage';

/**
 * List of all properties we attempt to extract during a copy operation.
 */
export const ALL_GRANULES = [
  'fills',
  'strokes',
  'effects',
  'rotation',
  'opacity',
  'cornerRadius',
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
  'strokeWeight',
  'strokeAlign',
  'dashPattern',
  'strokeCap',
  'strokeJoin',
  'strokeMiterLimit',
  'itemSpacing',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'layoutMode',
  'primaryAxisSizingMode',
  'counterAxisSizingMode',
  'primaryAxisAlignItems',
  'counterAxisAlignItems',
  'layoutGrids',
  'constraints',
  'blendMode',
  'exportSettings',
  'characters', // for text content
  'textStyleId',
  'fontName',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'paragraphSpacing',
  'paragraphIndent',
  'textCase',
  'textDecoration',
  'x',
  'y',
];

/**

 * Handles the 'copy' command from Quick Actions.

 */

export async function handleCopyCommand(
  options: { shouldClose?: boolean } = { shouldClose: true }
) {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1) {
    figma.notify('Please select exactly one object to copy.');

    if (options.shouldClose) figma.closePlugin();

    return;
  }

  const node = selection[0];

  // Extract all properties. extraction utility handles missing properties gracefully.

  const properties = await extractProperties(node, ALL_GRANULES);

  let preview: Uint8Array | null = null;

  try {
    const bytes = await node.exportAsync({
      format: 'PNG',

      constraint: { type: 'SCALE', value: 2 },
    });

    preview = bytes;
  } catch (e) {
    console.error('Failed to generate preview', e);
  }

  const data = Object.assign({}, properties, {
    preview,
    name: node.name,
    id: node.id,
    ancestors: getAncestors(node),
  });

  await saveProperties(data);

  figma.notify(`Properties copied from ${node.name}`);

  if (options.shouldClose) {
    figma.closePlugin();
  } else {
    // Notify UI

    figma.ui.postMessage({ type: 'COPY_COMPLETED', data });
  }
}

/**
 * Handles 'paste' commands from Quick Actions.
 */

export async function handlePasteCommand(
  granules: string[],
  options: { shouldClose?: boolean } = { shouldClose: true }
) {
  const data = await loadProperties();

  if (!data) {
    figma.notify('No properties copied yet. Use Copy first.');

    if (options.shouldClose) figma.closePlugin();

    return;
  }

  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('Please select at least one object to paste to.');

    if (options.shouldClose) figma.closePlugin();

    return;
  }

  let successCount = 0;

  const skippedNodes: SceneNode[] = [];

  for (const node of selection) {
    let nodeSupportedAny = false;

    let appliedAny = false;

    // Special handling for Text properties (require font loading)

    const textProps = [
      'characters',
      'fontName',
      'fontSize',
      'lineHeight',
      'letterSpacing',
      'paragraphSpacing',
      'paragraphIndent',
      'textCase',
      'textDecoration',
    ];

    const nodeIsText = node.type === 'TEXT';

    const hasTextGranules = granules.some((g) => textProps.includes(g));

    if (nodeIsText && hasTextGranules) {
      try {
        const fontName = (data.fontName ||
          (node as TextNode).fontName) as FontName;

        await figma.loadFontAsync(fontName);
      } catch (e) {
        console.error('Failed to load font', e);
      }
    }

    // Special handling for Size (width/height)

    if (granules.includes('width') || granules.includes('height')) {
      const parent = node.parent;

      const isInsideAutoLayout =
        parent &&
        'layoutMode' in parent &&
        (parent as any).layoutMode !== 'NONE';

      if (
        isInsideAutoLayout &&
        ('primaryAxisSizingMode' in data || 'counterAxisSizingMode' in data)
      ) {
        // Apply sizing modes if inside Auto Layout

        if (
          'primaryAxisSizingMode' in data &&
          'primaryAxisSizingMode' in node
        ) {
          (node as any).primaryAxisSizingMode = data.primaryAxisSizingMode;

          appliedAny = true;
        }

        if (
          'counterAxisSizingMode' in data &&
          'counterAxisSizingMode' in node
        ) {
          (node as any).counterAxisSizingMode = data.counterAxisSizingMode;

          appliedAny = true;
        }

        nodeSupportedAny = true;
      } else if ('resize' in node) {
        // Apply raw dimensions if not in Auto Layout (or no modes in data)

        const w = 'width' in data ? data.width : node.width;

        const h = 'height' in data ? data.height : node.height;

        try {
          (node as any).resize(w, h);

          appliedAny = true;
        } catch (e) {
          console.error(`Failed to resize ${node.name}`, e);
        }

        nodeSupportedAny = true;
      }
    }

    for (const granule of granules) {
      // Skip width/height as handled above

      if (granule === 'width' || granule === 'height') continue;

      // Check if we have data for this granule

      if (granule in data) {
        // Check if node supports this property

        if (granule in node) {
          nodeSupportedAny = true;

          try {
            (node as any)[granule] = data[granule];

            appliedAny = true;
          } catch (e) {
            console.error(`Failed to apply ${granule} to ${node.name}`, e);
          }
        }
      }
    }

    if (appliedAny) {
      successCount++;
    } else if (!nodeSupportedAny) {
      skippedNodes.push(node);
    }
  }

  const granuleLabels =
    granules.length > 3 ? `${granules.length} properties` : granules.join(', ');

  let message = `Pasted ${granuleLabels} to ${successCount} object${successCount === 1 ? '' : 's'}`;

  if (skippedNodes.length > 0) {
    const uniqueNames = Array.from(new Set(skippedNodes.map((n) => n.name)));

    message += `. Skipped ${uniqueNames.join(', ')} (incompatible).`;
  }

  figma.notify(message);

  if (options.shouldClose) {
    figma.closePlugin();
  }
}

function getAncestors(node: SceneNode): { name: string; id: string }[] {
  const ancestors: { name: string; id: string }[] = [];
  let current = node.parent;
  while (current && current.type !== 'PAGE' && current.type !== 'DOCUMENT') {
    ancestors.unshift({ name: current.name, id: current.id });
    current = current.parent;
  }
  return ancestors;
}
