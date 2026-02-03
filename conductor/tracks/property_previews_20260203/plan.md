# Implementation Plan: Property Previews

## Phase 1: Infrastructure & Scalar Previews (Values & Typography) [checkpoint: 636d373]
Establish the `preview` prop pattern and implement end-to-end support for simpler scalar values (Opacity, Rotation, Corner Radius) and Typography.

- [x] Task: Update PropertyButton Component [a90efd3]
    - [ ] Update `PropertyButton.tsx` to accept a `preview` prop
    - [ ] Refactor layout to Flexbox (justify-content: space-between)
- [x] Task: Backend - Implement "Dominant Value" logic for Mixed Properties [213ac22]
    - [ ] Create unit tests for `figma.mixed` scenarios in `extraction.test.ts`
    - [ ] Implement logic to extract the first/dominant value when `figma.mixed` is encountered
- [x] Task: Backend - Enhance extraction.ts for Text Styles [e7bb2f6]
    - [ ] Implement `textStyleId` resolution to names
    - [ ] Add `textStyleName` to the result object
- [x] Task: UI - Create ValuePreview Component [849ca4f]
    - [ ] Implement `ValuePreview.tsx` for numeric/scalar values
    - [ ] Add unit tests in `ValuePreview.test.tsx`
- [x] Task: UI - Create TypographyPreview Component [598c767]
    - [ ] Implement `TypographyPreview.tsx` with Style Name support
    - [ ] Add unit tests in `TypographyPreview.test.tsx`
- [x] Task: Integration - Scalar & Typography [26a23c1]
    - [ ] Update `App.tsx` to use `ValuePreview` and `TypographyPreview`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Scalar Previews' (Protocol in workflow.md)

## Phase 2: Color & Fill Previews [checkpoint: e58b357]
Implement end-to-end support for Fills, handling the complexity of color swatches, style resolution, and variable bindings.

- [x] Task: Backend - Enhance extraction.ts for Fills [37b0410]
    - [ ] Implement style resolution for Fills (`fillStyleId`)
    - [ ] Implement variable resolution for Fills (`figma.variables.getVariableById`)
    - [ ] Update result object with `fillStyleName` and `fillVariableName`
- [x] Task: UI - Create ColorPreview Component [402dc33]
    - [ ] Implement `ColorPreview.tsx` with swatches and Style/Variable priority logic
    - [ ] Add unit tests in `ColorPreview.test.tsx`
- [x] Task: Integration - Fills [af78329]
    - [ ] Update `App.tsx` to integrate `ColorPreview` for Fills
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Color & Fill Previews' (Protocol in workflow.md)

## Phase 3: Stroke & Effect Previews [checkpoint: 4556a8a]
Implement end-to-end support for Strokes and Effects.

- [x] Task: Backend - Enhance extraction.ts for Strokes & Effects [a52b98f]
    - [ ] Implement style/variable resolution for Strokes
    - [ ] Implement style resolution for Effects
    - [ ] Update result object with companion fields
- [x] Task: UI - Create StrokePreview and EffectPreview Components [536a36c]
    - [ ] Implement `StrokePreview.tsx` and `EffectPreview.tsx`
    - [ ] Add unit tests for both
- [x] Task: Integration - Strokes & Effects [f6805bf]
    - [ ] Update `App.tsx` to integrate `StrokePreview` and `EffectPreview`
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Stroke & Effect Previews' (Protocol in workflow.md)

## Phase 4: Final Polish
Verify consistency and edge cases across all previews.

- [ ] Task: Final Verification and Styling Polish
    - [ ] Verify "Unknown Style" indicators display correctly
    - [ ] Ensure visual consistency with Figma's native aesthetic
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Polish' (Protocol in workflow.md)
