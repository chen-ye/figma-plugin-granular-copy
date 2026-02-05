import { FigmaPluginAPI } from './figma-api';

// Initialize mock
const figmaMock = new FigmaPluginAPI();

// Assign to global scope
(self as any).figma = figmaMock;
(self as any).__html__ = ''; // Mock global

// Import the main bundle
import '../main/main';
