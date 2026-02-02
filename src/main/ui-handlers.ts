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
  }
}
