import { handleCopyCommand, handlePasteCommand } from './commands';

const { command } = figma;

if (command === 'copy') {
  handleCopyCommand();
} else if (command === 'paste-fills') {
  handlePasteCommand(['fills']);
} else if (command === 'paste-strokes') {
  handlePasteCommand(['strokes']);
} else if (command === 'paste-effects') {
  handlePasteCommand(['effects']);
} else {
  figma.showUI(__html__);
}


