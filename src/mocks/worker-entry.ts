import { FigmaPluginAPI } from './figma-api';

// Initialize mock
const figmaMock = new FigmaPluginAPI();

// Assign to global scope
(self as unknown as { figma: FigmaPluginAPI }).figma = figmaMock;
(self as unknown as { __html__: string }).__html__ = '';

// Import the main bundle dynamically to ensure global figma is set
import('../main/main');
