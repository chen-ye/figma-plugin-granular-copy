import type { ExtendedPaint } from '../types';
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
  'width',
  'height',
];

/**

 * Handles the 'copy' command from Quick Actions.

 */

export async function handleCopyCommand() {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1) {
    figma.notify('Please select exactly one object to copy.');

    return;
  }

  const node = selection[0];

  // Extract all properties. extraction utility handles missing properties gracefully.

  const properties = await extractProperties(node, ALL_GRANULES);

  let preview: Uint8Array | null = null;

  try {
    // Determine optimal scale for preview
    // Target matches the plugin window width (default 320) and fixed height (~120) * 2 for retina
    // We fetch the window size, defaulting to 320 if not set.
    const savedSize = await figma.clientStorage.getAsync('plugin_window_size');
    const windowWidth =
      savedSize && typeof savedSize === 'object' && 'width' in savedSize
        ? (savedSize as { width: number }).width
        : 320;

    const targetWidth = windowWidth * 2;
    const TARGET_HEIGHT = 240; // 120 * 2

    // Discrete scale steps to use to avoid aliasing artifacts from arbitrary scaling
    const SCALES = [2, 1.5, 1, 0.5, 0.25, 0.1];

    // Calculate the absolute maximum scale that fits within dimensions, capped at 2x
    const scaleUpperLimit = Math.min(
      2,
      targetWidth / node.width,
      TARGET_HEIGHT / node.height
    );

    // Find the largest discrete scale that fits within the limit
    let scale = SCALES.find((s) => s <= scaleUpperLimit);

    // If even the smallest discrete scale don't fit (node is huge), fall back to the calculated limit
    if (scale === undefined) {
      scale = scaleUpperLimit;
    }

    const bytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: scale },
    });

    preview = bytes;
  } catch (e) {
    console.error('Failed to generate preview', e);
  }

  // Calculate brightness to determine appropriate background contrast
  // If component is light, we want dark background. If component is dark, we want light background.
  let previewLabel: 'light' | 'dark' = 'light';
  if ('fills' in properties && Array.isArray(properties.fills)) {
    // Check if we have any visible fills
    const visibleFills = (properties.fills as ExtendedPaint[]).filter(
      (f) => f.visible !== false
    );
    if (visibleFills.length > 0) {
      // Use the top-most fill for simplicity (last in array for Figma visual stack usually? No, first is top in API)
      // Figma API: "The first fill in the array is the top fill."
      const topFill = visibleFills[0];
      if (topFill.type === 'SOLID') {
        const { r, g, b } = topFill.color;
        // Relative luminance formula: 0.2126*R + 0.7152*G + 0.0722*B
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // If luminance is high (light), label is 'light' (so UI knows component is light).
        // UI will sets background to dark for light components.
        previewLabel = luminance > 0.5 ? 'light' : 'dark';
      } else if (topFill.type === 'IMAGE' || topFill.type === 'VIDEO') {
        // Assume images might be mixed, default to 'light' (dark bg) or mid-grey?
        // Let's stick to default 'light' component (dark bg) as it's safer for images usually.
        previewLabel = 'light';
      }
    }
  }

  const data = Object.assign({}, properties, {
    preview,
    previewLabel,
    name: node.name,
    id: node.id,
    ancestors: getAncestors(node),
  });

  await saveProperties(data);

  figma.notify(`Properties copied from ${node.name}`);

  // Notify UI
  try {
    figma.ui.postMessage({ type: 'COPY_COMPLETED', data });
  } catch (e) {
    console.log('Failed to notify UI', e);
    // UI likely not open, ignore
  }
}

/**
 * Handles 'paste' commands from Quick Actions.
 */

export async function handlePasteCommand(granules: string[]) {
  const data = await loadProperties();

  if (!data) {
    figma.notify('No properties copied yet. Use Copy first.');

    return;
  }

  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('Please select at least one object to paste to.');

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
        (parent as FrameNode).layoutMode !== 'NONE';

      if (
        isInsideAutoLayout &&
        ('primaryAxisSizingMode' in data || 'counterAxisSizingMode' in data)
      ) {
        // Apply sizing modes if inside Auto Layout

        if (
          'primaryAxisSizingMode' in data &&
          'primaryAxisSizingMode' in node
        ) {
          (node as FrameNode).primaryAxisSizingMode =
            data.primaryAxisSizingMode as 'FIXED' | 'AUTO';

          appliedAny = true;
        }

        if (
          'counterAxisSizingMode' in data &&
          'counterAxisSizingMode' in node
        ) {
          (node as FrameNode).counterAxisSizingMode =
            data.counterAxisSizingMode as 'FIXED' | 'AUTO';

          appliedAny = true;
        }

        nodeSupportedAny = true;
      } else if ('resize' in node) {
        // Apply raw dimensions if not in Auto Layout (or no modes in data)

        const w =
          'width' in data && typeof data.width === 'number'
            ? data.width
            : (node.width as number);

        const h =
          'height' in data && typeof data.height === 'number'
            ? data.height
            : (node.height as number);

        try {
          (node as LayoutMixin).resize(w, h);

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
            // biome-ignore lint/suspicious/noExplicitAny: Dynamic assignment
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
