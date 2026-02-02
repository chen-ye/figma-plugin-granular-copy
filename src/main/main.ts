import { handleCopyCommand } from './commands';

if (figma.command === 'copy') {
  handleCopyCommand();
} else {
  figma.showUI(__html__);
}

