export type {
  GradientPaint,
  ImagePaint,
  PatternPaint,
  SolidPaint,
  VideoPaint,
} from '@figma/plugin-typings/plugin-api-standalone.js';

// Re-export Paint type for use in UI and main process
export type Paint =
  | SolidPaint
  | GradientPaint
  | ImagePaint
  | VideoPaint
  | PatternPaint;

export interface PaintMetadata {
  variableName?: string;
}

export interface ExtractionResult extends Record<string, unknown> {
  fills?: Paint[];
  strokes?: Paint[];
  fillMetadata?: Record<number, PaintMetadata>;
  strokeMetadata?: Record<number, PaintMetadata>;
  textStyleName?: string;
  fillStyleName?: string;
  strokeStyleName?: string;
  effectStyleName?: string;
  fillVariableName?: string;
  strokeVariableName?: string;
  strokeWeight?: number;
  opacity?: number;
  cornerRadius?: number;
  rotation?: number;
  fontName?: { family: string; style: string };
  fontSize?: number;
  previewLabel?: 'light' | 'dark';
  // Add other known properties as needed
}

export type PluginMessage =
  | { type: 'PASTE_PROPERTY'; granules: string[] }
  | { type: 'RESIZE_UI'; width: number; height: number }
  | { type: 'SAVE_UI_SIZE'; width: number; height: number }
  | { type: 'COPY_SELECTION' }
  | { type: 'SELECT_NODE'; id: string }
  | { type: 'UI_READY' }
  | { type: 'PING' }
  | { type: 'PONG' }
  | { type: 'NOTIFY'; message: string }; // Example, if needed

export interface UIMessage {
  pluginMessage: PluginMessage;
}

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
  'fillStyleId',
  'strokeStyleId',
  'effectStyleId',
  'fontName',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'paragraphSpacing',
  'paragraphIndent',
  'listSpacing',
  'textCase',
  'textDecoration',
  'x',
  'y',
  'width',
  'height',
  'layoutWrap',
  'layoutAlign',
  'layoutGrow',
] as const;

export type Granule = (typeof ALL_GRANULES)[number];
