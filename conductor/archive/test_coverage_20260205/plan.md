# Implementation Plan: Comprehensive Test Coverage Improvement

This plan follows a scenario-based approach to improve test coverage across the project, focusing on error handling, UI state, and IPC robustness to meet the >80% coverage mandate.

## Phase 1: Error Handling & Main Thread Robustness [checkpoint: 7a2b3c4]
Focus on `src/main/main.ts`, `src/main/ui-handlers.ts`, and `src/main/commands.ts`.

- [x] Task: Coverage - Error Handling in Command Routing (`main.ts`)
    - [x] Write tests for unknown command handling
    - [x] Implement tests for initialization failures
- [x] Task: Coverage - IPC Error Scenarios (`ui-handlers.ts`)
    - [x] Write tests for malformed UI messages
    - [x] Write tests for unexpected message types
- [x] Task: Coverage - Command Edge Cases (`commands.ts` & `extraction.ts`)
    - [x] Write tests for empty selections in all paste commands
    - [x] Write tests for unsupported node types during extraction
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: UI State & Interaction Coverage [checkpoint: 8d9e0f1]
Focus on `src/ui/App.tsx` and `src/ui/components/HeaderActions.tsx`.

- [x] Task: Coverage - App State Transitions (`App.tsx`)
    - [x] Write tests for 'selection-change' message handling
    - [x] Write tests for 'copy-success' and 'paste-success' feedback states
    - [x] Write tests for error boundary/display state
- [x] Task: Coverage - Header Actions (`HeaderActions.tsx`)
    - [x] Write tests for help button interactions
    - [x] Write tests for settings/config UI triggers (if applicable)
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Final Integration & Coverage Validation [checkpoint: 2a3b4c5]
Ensure the entire project meets the global threshold.

- [x] Task: Coverage - Comprehensive Mocking Improvements
    - [x] Refactor `figma` global mocks to support dynamic error injection
- [x] Task: Coverage - Final Audit
    - [x] Run `npm run test:ci -- --coverage` and verify all modules >= 80%
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)