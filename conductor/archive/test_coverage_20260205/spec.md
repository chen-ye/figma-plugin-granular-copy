# Specification: Comprehensive Test Coverage Improvement

## Overview
This track aims to increase the project's test coverage to meet the mandatory >80% threshold defined in the `workflow.md`. Currently, overall coverage is at ~73%, with several critical modules well below the target. We will use a scenario-based approach, prioritizing error handling and edge cases across the codebase.

## Targeted Modules
- `src/main/main.ts` (Current: ~43% Lines)
- `src/main/ui-handlers.ts` (Current: ~38% Lines)
- `src/main/commands.ts` (Current: ~89% Lines - improve branches/funcs)
- `src/main/extraction.ts` (Current: ~83% Lines - improve branches)
- `src/ui/App.tsx` (Current: ~45% Lines)
- `src/ui/components/HeaderActions.tsx` (Current: ~70% Lines)

## Functional Requirements
- **Error Handling Scenarios:** Implement tests for all "catch" blocks and error conditions (e.g., empty selections, invalid data, postMessage failures).
- **UI State Transitions:** Verify `App.tsx` responds correctly to all message types from the main thread and internal state changes.
- **IPC Robustness:** Test communication edge cases between Main and UI threads in `ui-handlers.ts`.
- **Figma API Mocking:** Enhance mocks to simulate varied Figma environment states (e.g., different node types, headless mode).

## Acceptance Criteria
- [ ] Total project line coverage is >= 80%.
- [ ] Each targeted module individually reaches >= 80% line coverage.
- [ ] All tests pass using `npm run test:ci`.
- [ ] Coverage reports are generated and verified for each module.

## Out of Scope
- Refactoring application logic (unless strictly necessary to make code testable).
- End-to-end testing with actual Figma instances (sticking to Vitest/JSDOM).
