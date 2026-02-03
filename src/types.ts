import type {
  GradientPaint,
  ImagePaint,
  PatternPaint,
  SolidPaint,
  VariableAlias,
  VideoPaint,
} from '@figma/plugin-typings/plugin-api-standalone.js';

// Re-export Paint type for use in UI and main process
export type Paint =
  | SolidPaint
  | GradientPaint
  | ImagePaint
  | VideoPaint
  | PatternPaint;

export type ExtendedPaint = Paint & {
  boundVariables?: {
    color?: VariableAlias;
  };
};

export interface ExtractionResult extends Record<string, unknown> {
  fills?: ExtendedPaint[];
  strokes?: ExtendedPaint[];
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
  // Add other known properties as needed
}

export type PluginMessage =
  | { type: 'PASTE_PROPERTY'; granules: string[] }
  | { type: 'RESIZE_UI'; width: number; height: number }
  | { type: 'SAVE_UI_SIZE'; width: number; height: number }
  | { type: 'COPY_SELECTION' }
  | { type: 'SELECT_NODE'; id: string }
  | { type: 'UI_READY' }
  | { type: 'NOTIFY'; message: string }; // Example, if needed

export interface UIMessage {
  pluginMessage: PluginMessage;
}
