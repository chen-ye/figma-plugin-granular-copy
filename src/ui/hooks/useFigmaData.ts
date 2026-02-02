import { useState, useEffect } from 'react';

export function useFigmaData() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Figma sends messages nested in pluginMessage
      const msg = event.data.pluginMessage;
      if (!msg) return;

      const { type, data: msgData } = msg;
      if (type === 'DATA_UPDATE' || type === 'COPY_COMPLETED') {
        setData(msgData);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial data if needed, but usually main sends it on open
    // parent.postMessage({ pluginMessage: { type: 'REQUEST_DATA' } }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return { data };
}
