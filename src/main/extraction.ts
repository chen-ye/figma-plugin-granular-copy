/**
 * Extracts specific properties from a Figma node.
 * Handles granules like 'fills', 'strokes', and 'effects'.
 */
export function extractProperties(node: SceneNode, granules: string[]): any {
  const result: any = {};

  for (const granule of granules) {
    if (granule in node) {
      const value = (node as any)[granule];
      
      // Handle figma.mixed if necessary, but for now we clone the array/value
      // In a real plugin, we might want to deep clone or handle special cases
      result[granule] = value;
    }
  }

  return result;
}
