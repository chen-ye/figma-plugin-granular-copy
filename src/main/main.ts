import type { PluginMessage } from '../types';
import {
  ALL_GRANULES,
  handleCopyCommand,
  handlePasteCommand,
} from './commands';
import { loadProperties } from './storage';
import { handleUIMessage } from './ui-handlers';

// Track if UI is open using dynamic ping
let pongResolver: ((value: boolean) => void) | null = null;

function checkUIOpen(): Promise<boolean> {
  return new Promise((resolve) => {
    pongResolver = resolve;
    try {
      figma.ui.postMessage({ type: 'PING' });
    } catch (_e) {
      if (pongResolver) {
        pongResolver(false);
        pongResolver = null;
      }
    }
    setTimeout(() => {
      if (pongResolver) {
        pongResolver(false); // Timeout means UI is likely closed
        pongResolver = null;
      }
    }, 200); // 200ms timeout
  });
}

async function executeAndMaybeClose(action: () => Promise<void> | void) {
  // Execute action first
  await action();

  // Then check if we should close
  const isUIOpen = await checkUIOpen();
  if (!isUIOpen) {
    figma.closePlugin();
  }
}

figma.on('run', ({ command }: RunEvent) => {
  if (command === 'copy') {
    executeAndMaybeClose(() => handleCopyCommand());
  } else if (command === 'paste-fills') {
    executeAndMaybeClose(() => handlePasteCommand(['fills']));
  } else if (command === 'paste-strokes') {
    executeAndMaybeClose(() => handlePasteCommand(['strokes']));
  } else if (command === 'paste-effects') {
    executeAndMaybeClose(() => handlePasteCommand(['effects']));
  } else if (command === 'paste-corner-radius') {
    executeAndMaybeClose(() =>
      handlePasteCommand([
        'cornerRadius',
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
      ])
    );
  } else if (command === 'paste-opacity') {
    executeAndMaybeClose(() => handlePasteCommand(['opacity']));
  } else if (command === 'paste-blend-mode') {
    executeAndMaybeClose(() => handlePasteCommand(['blendMode']));
  } else if (command === 'paste-position') {
    executeAndMaybeClose(() => handlePasteCommand(['x', 'y']));
  } else if (command === 'paste-size') {
    executeAndMaybeClose(() => handlePasteCommand(['width', 'height']));
  } else if (command === 'paste-rotation') {
    executeAndMaybeClose(() => handlePasteCommand(['rotation']));
  } else if (command === 'paste-auto-layout') {
    executeAndMaybeClose(() =>
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
      ])
    );
  } else if (command === 'paste-constraints') {
    executeAndMaybeClose(() => handlePasteCommand(['constraints']));
  } else if (command === 'paste-layout-grids') {
    executeAndMaybeClose(() => handlePasteCommand(['layoutGrids']));
  } else if (command === 'paste-text-content') {
    executeAndMaybeClose(() => handlePasteCommand(['characters']));
  } else if (command === 'paste-text-styles') {
    executeAndMaybeClose(() =>
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
      ])
    );
  } else if (command === 'paste-export-settings') {
    executeAndMaybeClose(() => handlePasteCommand(['exportSettings']));
  } else if (command === 'paste-all') {
    executeAndMaybeClose(() => handlePasteCommand(ALL_GRANULES));
  } else if (command === 'open-ui' || !command) {
    // Load saved size or default
    figma.clientStorage.getAsync('plugin_window_size').then((savedSize) => {
      let width = 320;
      let height = 640;
      if (
        savedSize &&
        typeof savedSize === 'object' &&
        'width' in savedSize &&
        'height' in savedSize
      ) {
        const size = savedSize as { width: number; height: number };
        width = size.width || 320;
        height = size.height || 640;
      }
      figma.showUI(__html__, { width, height, themeColors: true });
      sendInitialState();
    });
  }
});

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

figma.ui.onmessage = (msg: PluginMessage) => {
  if (msg.type === 'PONG') {
    if (pongResolver) {
      pongResolver(true);
      pongResolver = null;
    }
  } else if (msg.type === 'UI_READY') {
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
