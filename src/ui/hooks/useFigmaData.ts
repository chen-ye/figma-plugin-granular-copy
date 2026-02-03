import { useEffect, useState } from 'react';
import type { ExtractionResult } from '../../types';

export type FigmaData =
  | (ExtractionResult & {
      id?: string;
      name?: string;
      ancestors?: { name: string; id: string }[];
      preview?: Uint8Array | number[];
    })
  | null;

export function useFigmaData() {
  const [data, setData] = useState<FigmaData>(null);
  const [supportedGranules, setSupportedGranules] = useState<string[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Figma sends messages nested in pluginMessage
      const msg = event.data.pluginMessage;
      if (!msg) return;

      const { type, data: msgData, supportedGranules: msgSupported } = msg;

      switch (type) {
        case 'DATA_UPDATE':
        case 'COPY_COMPLETED':
          // Ensure we always set a new object reference to trigger reactivity
          setData(msgData ? { ...msgData } : null);
          break;
        case 'SELECTION_UPDATE':
          setSupportedGranules(msgSupported || []);
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify backend that UI is ready to receive data
    parent.postMessage({ pluginMessage: { type: 'UI_READY' } }, '*');

    // Request initial data if needed, but usually main sends it on open
    // parent.postMessage({ pluginMessage: { type: 'REQUEST_DATA' } }, '*');

    const handlePing = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg && msg.type === 'PING') {
        parent.postMessage({ pluginMessage: { type: 'PONG' } }, '*');
      }
    };
    window.addEventListener('message', handlePing);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('message', handlePing);
    };
  }, []);

  return { data, supportedGranules };
}
