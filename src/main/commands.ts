import { extractProperties } from './extraction';
import { saveProperties } from './storage';

/**
 * List of all properties we attempt to extract during a copy operation.
 */
export const ALL_GRANULES = [
  'fills',
  'strokes',
  'effects',
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
  'characters' // for text content
];

/**
 * Handles the 'copy' command from Quick Actions.
 */
export async function handleCopyCommand() {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1) {
    figma.notify('Please select exactly one object to copy.');
    figma.closePlugin();
    return;
  }

  const node = selection[0];
  // Extract all properties. extraction utility handles missing properties gracefully.
  const properties = extractProperties(node, ALL_GRANULES);
  
  await saveProperties(properties);
  
  figma.notify(`Properties copied from ${node.name}`);
  figma.closePlugin();
}
