# Implementation Plan: CI Pipeline with GitHub Actions

## Phase 1: Workflow Configuration
- [x] Task: Create GitHub Actions Workflow
    - [x] Create the `.github/workflows/` directory.
    - [x] Create `ci.yml` with triggers for `push` and `pull_request`.
    - [x] Configure the job to run on `ubuntu-latest`.
    - [x] Use `actions/setup-node` with `node-version: 'lts/*'`.
    - [x] Implement caching for `npm` dependencies to speed up subsequent runs.
- [x] Task: Implement Verification Steps
    - [x] Add `npm ci` step for clean installation.
    - [x] Add `npm run check` step for linting (Biome + ESLint).
    - [x] Add `npm run typecheck` step.
    - [x] Add `npm run build` step to verify compilation.
    - [x] Add `npm run test:ci` step for unit testing (Vitest).
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: E2E Testing Integration [checkpoint: dcab636]
- [x] Task: Configure Playwright for CI
    - [x] Add Playwright browser installation step: `npx playwright install --with-deps chromium`.
    - [x] Add `npm run test:e2e` step.
    - [x] Configure artifact upload for Playwright reports on failure using `actions/upload-artifact`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Final Verification
- [x] Task: Final CI Audit
    - [x] Push changes to a feature branch to trigger the live workflow.
    - [x] Verify that all steps pass in the GitHub Actions dashboard.
    - [x] Add a CI status badge to `README.md`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
