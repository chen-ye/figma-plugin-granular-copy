import { handleCopyCommand, handlePasteCommand } from './commands';

/**
 * Handles messages sent from the UI (iframe) to the main process.
 */
export async function handleUIMessage(msg: any) {
  if (msg.type === 'COPY_SELECTION') {
    await handleCopyCommand({ shouldClose: false });
  } else if (msg.type === 'PASTE_PROPERTY') {
    const granules = msg.granules;
    if (Array.isArray(granules)) {
      await handlePasteCommand(granules, { shouldClose: false });
    }
  } else if (msg.type === 'SELECT_NODE') {
    const nodeId = msg.id;
    const node = await figma.getNodeByIdAsync(nodeId);
    if (node && 'type' in node) {
      // It's a SceneNode (mostly)
      figma.currentPage.selection = [node as SceneNode];
      figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
    }
  } else if (msg.type === 'RESIZE_UI') {
    // Attempt to maintain position using newer API properties
    // const ui = figma.ui;
    // const { windowSpace } = ui.getPosition();
    // console.log(windowSpace);
    // const { x, y } = windowSpace;

    figma.ui.resize(msg.width, msg.height);

    // Preserving window position seems quite tricky. Figure it out later.
    // if (typeof x === 'number' && typeof y === 'number') {
    //   figma.ui.reposition(x, y);
    // }
  } else if (msg.type === 'SAVE_UI_SIZE') {
    figma.clientStorage.setAsync('plugin_window_size', {
      width: msg.width,
      height: msg.height,
    });
  }
}
