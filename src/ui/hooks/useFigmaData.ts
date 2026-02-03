import { useState, useEffect } from 'react';

export function useFigmaData() {
  const [data, setData] = useState<any>(null);
  const [supportedGranules, setSupportedGranules] = useState<string[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Figma sends messages nested in pluginMessage
      const msg = event.data.pluginMessage;
      if (!msg) return;

      const { type, data: msgData, supportedGranules: msgSupported } = msg;
      if (type === 'DATA_UPDATE' || type === 'COPY_COMPLETED') {
        setData(msgData);
      } else if (type === 'SELECTION_UPDATE') {
        setSupportedGranules(msgSupported || []);
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
