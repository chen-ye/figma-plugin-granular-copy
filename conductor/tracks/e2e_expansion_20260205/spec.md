# Specification: Comprehensive E2E Testing Expansion

## Overview
This track builds upon the existing Playwright E2E infrastructure to implement a comprehensive suite of tests covering granular property logic, complex user flows, visual regression, and error handling. We will leverage the existing Web Worker mock setup but verify logic primarily through message passing assertions and visual snapshots.

## Functional Requirements

### 1. Detailed Property Logic (Message Verification)
-   **Goal:** Verify that interacting with each property button in the UI sends the correct IPC message to the Main thread.
-   **Method:** Intercept `postMessage` calls from the UI to the Worker.
-   **Scope:** Cover all granule types: Fills, Strokes, Effects, Opacity, Corner Radius, Position, Size, Rotation, Auto Layout, Constraints, Grids, Text Content, Text Styles, Export Settings.

### 2. Complex User Flows
-   **Copy & Paste Flow:**
    1.  Simulate "Selection Change" with a mock node in the Worker.
    2.  Click "Copy Selection" in UI.
    3.  Verify UI updates to "Copied" state (enabling buttons).
    4.  Click "Paste Fills".
    5.  Verify Worker receives `PASTE_PROPERTY` command.
-   **Preview Updates:**
    1.  Simulate changing selection to different node types (e.g., Image, Text).
    2.  Verify the UI preview thumbnail and metadata labels update accordingly.

### 3. Visual Regression
-   **Goal:** Ensure UI styling remains consistent.
-   **Method:** Use Playwright's `expect(page).toHaveScreenshot()`.
-   **Scenarios:**
    -   Default "Empty" state.
    -   "Copied" state with rich data (Fills, Strokes, etc.).
    -   "Dark Mode" (if applicable/mockable).

### 4. Error Handling
-   **Goal:** Verify UI resilience to Main thread failures.
-   **Method:** Implement a `MOCK_ERROR_NEXT` command in the `FigmaMock`.
-   **Scenarios:**
    -   Simulate a failure during "Copy Selection".
    -   Verify the UI displays an appropriate error notification or state.

## Acceptance Criteria
-   [ ] `tests/e2e/properties.spec.ts` implements message verification for all granule types.
-   [ ] `tests/e2e/flows.spec.ts` covers "Copy & Paste" and "Preview Updates" scenarios.
-   [ ] `tests/e2e/visual.spec.ts` implements snapshot tests for key UI states.
-   [ ] `tests/e2e/errors.spec.ts` verifies error handling using mock injection.
-   [ ] `src/mocks/figma-api.ts` is updated to support `MOCK_ERROR_NEXT` injection.

## Out of Scope
-   Mocking the entire complex Figma node graph behavior (we assume the Worker receives the command and "pretends" to succeed unless told to fail).
