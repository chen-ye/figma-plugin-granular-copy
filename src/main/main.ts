import { handleCopyCommand, handlePasteCommand, ALL_GRANULES } from './commands';

const { command } = figma;

if (command === 'copy') {
  handleCopyCommand();
} else if (command === 'paste-fills') {
  handlePasteCommand(['fills']);
} else if (command === 'paste-strokes') {
  handlePasteCommand(['strokes']);
} else if (command === 'paste-effects') {
  handlePasteCommand(['effects']);
} else if (command === 'paste-corner-radius') {
  handlePasteCommand(['cornerRadius', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']);
} else if (command === 'paste-opacity') {
  handlePasteCommand(['opacity']);
} else if (command === 'paste-blend-mode') {
  handlePasteCommand(['blendMode']);
} else if (command === 'paste-position') {
  handlePasteCommand(['x', 'y']);
} else if (command === 'paste-size') {
  handlePasteCommand(['width', 'height']);
} else if (command === 'paste-rotation') {
  handlePasteCommand(['rotation']);
} else if (command === 'paste-auto-layout') {
  handlePasteCommand(['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'layoutMode', 'layoutWrap']);
} else if (command === 'paste-constraints') {
  handlePasteCommand(['constraints']);
} else if (command === 'paste-layout-grids') {
  handlePasteCommand(['layoutGrids']);
} else if (command === 'paste-text-content') {
  handlePasteCommand(['characters']);
} else if (command === 'paste-text-styles') {
  handlePasteCommand(['textStyleId', 'fontName', 'fontSize', 'lineHeight', 'letterSpacing', 'paragraphSpacing', 'paragraphIndent', 'textCase', 'textDecoration']);
} else if (command === 'paste-export-settings') {
  handlePasteCommand(['exportSettings']);
} else if (command === 'paste-all') {
  handlePasteCommand(ALL_GRANULES);
} else {
  figma.showUI(__html__);
}



