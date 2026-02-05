# Implementation Plan: Comprehensive E2E Testing Expansion

## Phase 1: Mock Infrastructure Enhancements [checkpoint: 75fb1fe]
- [x] Task: Update Figma Mock for Error Injection [manual]
    - [x] Modify `src/mocks/figma-api.ts` to handle `MOCK_ERROR_NEXT`.
    - [x] Implement logic to throw/reject in `handleCopyCommand` (or generic command handler) when this flag is set.
- [x] Task: Enhance Harness for Message Sniffing [manual]
    - [x] Ensure `tests/e2e/harness.html` exposes a robust way to "spy" on messages sent *to* the worker without intercepting/blocking them, if not already present.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Property Logic & Flow Tests
- [x] Task: Implement Property Logic Tests
    - [x] Create `tests/e2e/properties.spec.ts`.
    - [x] Write data-driven tests for each granule type (Fills, Strokes, etc.) verifying the `postMessage` payload.
- [x] Task: Implement Complex Flow Tests
    - [x] Create `tests/e2e/flows.spec.ts`.
    - [x] Implement "Copy & Paste" flow (Simulate Selection -> Click Copy -> Verify State -> Click Paste -> Verify Worker Message).
    - [x] Implement "Preview Updates" flow (Change Selection -> Verify UI Update).
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Visual & Error Testing
- [ ] Task: Implement Visual Regression Tests
    - [ ] Create `tests/e2e/visual.spec.ts`.
    - [ ] Capture snapshots for "Empty" and "Populated" states.
- [ ] Task: Implement Error Handling Tests
    - [ ] Create `tests/e2e/errors.spec.ts`.
    - [ ] Use `MOCK_ERROR_NEXT` to simulate a Copy failure and verify UI response.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
