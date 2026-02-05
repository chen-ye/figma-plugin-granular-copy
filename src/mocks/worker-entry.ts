import { FigmaPluginAPI } from './figma-api';

// Initialize mock
const figmaMock = new FigmaPluginAPI();

// Assign to global scope
(self as any).figma = figmaMock;
(self as any).__html__ = '';

// Import the main bundle dynamically to ensure global figma is set
import('../main/main');