# Implementation Plan - Enable Build Sourcemaps

## Phase 1: Configuration & Verification [checkpoint: ]
- [x] Task: Enable sourcemaps in Vite configurations (5998a64)
    - [ ] Update `vite.config.main.ts` to set `build.sourcemap: true`
    - [ ] Update `vite.config.ui.ts` to set `build.sourcemap: true`
- [x] Task: Verify build output (Verification passed)
    - [ ] Run `npm run build`
    - [ ] Confirm existence of `.js.map` files in `dist/`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Configuration & Verification' (Protocol in workflow.md)
