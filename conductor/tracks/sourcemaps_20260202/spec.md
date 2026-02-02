# Specification - Enable Build Sourcemaps

This track enables sourcemap generation for both the Figma main process and the React UI build to facilitate easier debugging.

## Overview
Update the Vite configuration to produce separate `.map` files during the build process.

## Functional Requirements
- **Sourcemap Generation:** Configure `vite.config.main.ts` and `vite.config.ui.ts` to generate separate sourcemap files.
- **Coverage:** Apply to all production build environments.

## Technical Requirements
- **Vite Config:** Set `build.sourcemap` to `true` in both configuration files.
- **Validation:** Verify that `.map` files are present in the `dist` directory after a successful build.

## Acceptance Criteria
- [ ] Running `npm run build` produces `.js.map` files in the `dist` folder.
- [ ] Sourcemaps correctly map minified output back to the original TypeScript source code.
