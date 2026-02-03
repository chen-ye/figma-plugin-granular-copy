import {
  ALL_GRANULES,
  handleCopyCommand,
  handlePasteCommand,
} from './commands';
import { loadProperties } from './storage.ts';
import { handleUIMessage } from './ui-handlers';

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
  handlePasteCommand([
    'cornerRadius',
    'topLeftRadius',
    'topRightRadius',
    'bottomLeftRadius',
    'bottomRightRadius',
  ]);
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
  handlePasteCommand([
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'itemSpacing',
    'primaryAxisAlignItems',
    'counterAxisAlignItems',
    'layoutMode',
    'layoutWrap',
  ]);
} else if (command === 'paste-constraints') {
  handlePasteCommand(['constraints']);
} else if (command === 'paste-layout-grids') {
  handlePasteCommand(['layoutGrids']);
} else if (command === 'paste-text-content') {
  handlePasteCommand(['characters']);
} else if (command === 'paste-text-styles') {
  handlePasteCommand([
    'textStyleId',
    'fontName',
    'fontSize',
    'lineHeight',
    'letterSpacing',
    'paragraphSpacing',
    'paragraphIndent',
    'textCase',
    'textDecoration',
  ]);
} else if (command === 'paste-export-settings') {
  handlePasteCommand(['exportSettings']);
} else if (command === 'paste-all') {
  handlePasteCommand(ALL_GRANULES);
} else if (command === 'open-ui') {
  // Load saved size or default
  figma.clientStorage.getAsync('plugin_window_size').then((savedSize) => {
    let width = 320;
    let height = 640;
    if (savedSize) {
      width = savedSize.width || 320;
      height = savedSize.height || 640;
    }
    figma.showUI(__html__, { width, height, themeColors: true });
    sendInitialState();
  });
}

/**
 * Sends the current selection and data to the UI.
 */
function sendInitialState() {
  // Send initial state
  loadProperties().then((data) => {
    figma.ui.postMessage({ type: 'DATA_UPDATE', data });
  });
  const supportedGranules = getSupportedGranules(figma.currentPage.selection);
  figma.ui.postMessage({ type: 'SELECTION_UPDATE', supportedGranules });
}

figma.ui.onmessage = (msg: any) => {
  if (msg.type === 'UI_READY') {
    sendInitialState();
  } else {
    handleUIMessage(msg);
  }
};

figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  const supportedGranules = getSupportedGranules(selection);
  figma.ui.postMessage({ type: 'SELECTION_UPDATE', supportedGranules });
});

/**
 * Returns a list of properties that can be applied to the current selection.
 */
function getSupportedGranules(selection: readonly SceneNode[]): string[] {
  if (selection.length === 0) return [];

  // For now, return properties supported by ANY node in the selection
  const allSupported = new Set<string>();
  for (const node of selection) {
    for (const granule of ALL_GRANULES) {
      if (granule in node) {
        allSupported.add(granule);
      }
    }
  }
  return Array.from(allSupported);
}
