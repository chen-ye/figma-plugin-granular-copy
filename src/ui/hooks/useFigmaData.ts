import { useState, useEffect } from 'react';

export type FigmaData = {
  id?: string;
  name?: string;
  ancestors?: { name: string; id: string }[];
  preview?: Uint8Array | number[];
  [key: string]: unknown;
} | null;

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

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return { data, supportedGranules };
}
