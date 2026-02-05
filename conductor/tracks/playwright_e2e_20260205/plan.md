# Implementation Plan: Limited E2E Testing with Playwright

## Phase 1: Environment & Mock Infrastructure
- [x] Task: Install Playwright and dependencies [9d30982]
    - [x] Run `npm init playwright@latest` (configured for `tests/e2e`).
- [x] Task: Create Shared Figma Mock
    - [x] Create `src/mocks/figma-api.ts` to house the mock implementation.
    - [ ] Refactor existing unit tests (e.g., `main.test.ts`) to use this shared mock. (Skipped to prioritize E2E setup)
- [x] Task: Setup Web Worker Harness [manual]
    - [x] Create a "Worker Entry" file that imports the shared mock and the actual `src/main/main.ts`.
    - [x] Configure a build step (using Vite) to bundle this worker code for the browser.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Playwright Integration & Communication
- [ ] Task: Configure Playwright Test Runner
    - [ ] Update `playwright.config.ts` to serve the UI and Worker bundles.
- [ ] Task: Implement Message Bridge
    - [ ] Create a "Test Harness" page (HTML/JS) that loads the UI iframe and the Web Worker.
    - [ ] Implement the `postMessage` relay logic in the harness.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Test Scenario Implementation
- [ ] Task: Implement UI Rendering Test
    - [ ] Write `tests/e2e/ui-rendering.spec.ts` to verify the app mounts.
- [ ] Task: Implement Communication Test
    - [ ] Write `tests/e2e/communication.spec.ts` to verify `SELECTION_UPDATE` flow.
- [ ] Task: Implement Persistence Test
    - [ ] Write `tests/e2e/persistence.spec.ts` to verify `clientStorage` mock usage.
- [ ] Task: Add NPM Scripts
    - [ ] Add `test:e2e` script to `package.json`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
