export class FigmaPluginAPI {
  command: string = '';
  private listeners: Record<string, Function[]> = {};
  private storage: Record<string, any> = {};

  ui = {
    postMessage: (msg: any) => {
      // Send to Test Harness
      postMessage({ type: 'FIGMA_UI_MESSAGE', payload: msg });
    },
    onmessage: null as ((msg: any) => void) | null,
    resize: (w: number, h: number) => {
      postMessage({ type: 'FIGMA_UI_RESIZE', width: w, height: h });
    },
    close: () => {
      postMessage({ type: 'FIGMA_CLOSE' });
    }
  };

  currentPage = {
    selection: [] as any[],
  };

  viewport = {
    scrollAndZoomIntoView: () => {},
  };

  variables = {
    getVariableByIdAsync: async () => null,
  };

  mixed = Symbol('mixed');

  private shouldFailNext = false;

  constructor() {
    // Listen for messages from the main thread (Test Harness)
    addEventListener('message', (event) => {
      const { type, payload } = event.data;
      if (type === 'UI_TO_MAIN') {
        if (this.ui.onmessage) {
          this.ui.onmessage(payload);
        }
      } else if (type === 'RUN_COMMAND') {
        this.command = payload.command;
        this.trigger('run', { command: payload.command });
      } else if (type === 'SET_SELECTION') {
        this.currentPage.selection = payload.map((node: any) => ({
          ...node,
          exportAsync: async () => new Uint8Array([]),
          getRangeFontSize: () => node.fontSize,
          getRangeFontName: () => node.fontName,
          getRangeLineHeight: () => node.lineHeight,
          getRangeLetterSpacing: () => node.letterSpacing,
          getRangeTextDecoration: () => node.textDecoration,
          getRangeTextCase: () => node.textCase,
          getRangeFills: () => node.fills,
          getRangeTextStyleId: () => node.textStyleId,
          getRangeFillStyleId: () => node.fillStyleId,
          getRangeParagraphSpacing: () => node.paragraphSpacing,
          getRangeParagraphIndent: () => node.paragraphIndent,
          getRangeListSpacing: () => node.listSpacing,
        }));
        this.trigger('selectionchange', {});
      } else if (type === 'MOCK_ERROR_NEXT') {
        this.shouldFailNext = true;
      }
    });
  }

  on(type: string, callback: Function) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(callback);
  }

  once(type: string, callback: Function) {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(type, wrapper);
    };
    this.on(type, wrapper);
  }

  off(type: string, callback: Function) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
  }

  trigger(type: string, event: any) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(cb => cb(event));
    }
  }

  showUI(html: string, options?: any) {
    postMessage({ type: 'FIGMA_SHOW_UI', html, options });
  }

  notify(message: string) {
    postMessage({ type: 'FIGMA_NOTIFY', message });
  }

  closePlugin() {
    postMessage({ type: 'FIGMA_CLOSE' });
  }

  clientStorage = {
    getAsync: async (key: string) => {
      if (this.shouldFailNext) {
        this.shouldFailNext = false;
        throw new Error('Simulated Figma Error');
      }
      return this.storage[key];
    },
    setAsync: async (key: string, value: any) => {
      this.storage[key] = value;
    }
  };

  loadFontAsync = async () => {};
  getNodeByIdAsync = async () => null;
  getStyleByIdAsync = async () => null;
}
