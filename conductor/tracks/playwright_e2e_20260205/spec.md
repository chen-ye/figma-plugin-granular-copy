# Specification: Limited E2E Testing with Playwright

## Overview
This track aims to establish a "limited" End-to-End (E2E) testing environment using Playwright. Unlike traditional E2E tests that might control the actual Figma application, this approach will run the plugin's UI in a real browser (controlled by Playwright) and the plugin's "Main" process in a Web Worker. This setup mocks the Figma API but verifies the critical integration points between the UI and the Main thread, as well as UI rendering and state persistence.

## Core Architecture
-   **Test Runner:** Playwright.
-   **Test Location:** `tests/e2e`.
-   **Main Thread Simulation:** The code from `src/main/main.ts` (and dependencies) will be bundled and run inside a Web Worker.
-   **UI Thread Simulation:** The code from `src/ui/ui.tsx` (and dependencies) will run in the main browser context (simulating the plugin iframe).
-   **Communication Bridge:** A message broker will relay `postMessage` calls between the Web Worker (Main) and the Browser Window (UI), mimicking Figma's `figma.ui.postMessage` and `parent.postMessage`.
-   **Shared Mocking:** The Figma API mocks should be structured to be reusable between these E2E tests and existing unit tests (Vitest) where possible to reduce duplication.

## Functional Requirements

### 1. Environment Setup
-   Configure Playwright to serve the plugin UI.
-   Create a "Figma Mock" layer that injects the `figma` global object into the Web Worker scope.
-   Refactor/Extract existing unit test mocks to a shared location (e.g., `src/mocks` or `tests/mocks`) for reuse.
-   Implement the message bridge to connect the Worker and the UI.

### 2. Testing Scenarios
-   **UI Rendering (A):** Verify that the UI renders correctly upon initialization.
-   **Main-UI Communication (B):**
    -   Test that actions in the UI (e.g., clicking "Paste") send the correct messages to the Worker.
    -   Test that messages from the Worker (e.g., `SELECTION_UPDATE`) correctly update the UI state.
-   **State Persistence (D):**
    -   Mock `figma.clientStorage` in the Worker.
    -   Verify that UI settings (like window size) are saved and restored via the mocked storage.

## Non-Functional Requirements
-   **Isolation:** The tests should not require a real Figma account or application.
-   **Performance:** Tests should run in a headless browser in CI environments.

## Acceptance Criteria
-   [ ] Playwright is installed and configured in `tests/e2e`.
-   [ ] A shared "Figma Mock" module is created and used by both E2E and Unit tests.
-   [ ] A Web Worker setup loads the plugin's main thread code with the injected mock.
-   [ ] At least one test case exists for **UI Rendering** (e.g., "App renders with default state").
-   [ ] At least one test case exists for **Communication** (e.g., "UI receives selection update").
-   [ ] At least one test case exists for **Persistence** (e.g., "Window size is restored").
-   [ ] The test suite can be run via a simplified NPM command (e.g., `npm run test:e2e`).

## Out of Scope
-   Automating the actual Figma desktop or web application.
-   Pixel-perfect visual regression testing (for now).
