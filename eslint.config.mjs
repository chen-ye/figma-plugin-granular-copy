import figmaPlugin from '@figma/eslint-plugin-figma-plugins';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'vite.config.*.ts',
      '*.js',
      '*.mjs',
      '*.cjs',
    ],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@figma/figma-plugins': figmaPlugin,
    },
    rules: {
      // safe-start: standard recommended rules might need adjustment for flat config mapping
      // but usually the plugin name in the rules key must match the plugin name in the plugins key.
      // The figma plugin likely enables 'no-missing-static-type' etc per their docs.
      // We'll define the namespace as '@figma/figma-plugins' to match standard naming if possible,
      // but often these plugins assume 'figma-plugins'. Use that for safety if unsure, or both.

      // Let's manually enable the critical ones or use the recommended config if compatible.
      // Since configs.recommended might have 'plugins': ['@figma/figma-plugins'], we need to match that.

      ...figmaPlugin.configs.recommended.rules,
    },
  },
];
