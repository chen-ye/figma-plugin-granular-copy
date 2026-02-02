# Implementation Plan - Implement All Property Granules

## Phase 1: Visual & Metadata Extraction [checkpoint: e269cfb]
- [x] Task: Expand Extraction logic for basic visuals (f4138f9)
- [x] Task: Implement Corner Radius logic (4f9562d)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Visual & Metadata Extraction' (Protocol in workflow.md) (e269cfb)

## Phase 2: Geometry & Layout Constraints [checkpoint: af94bb9]
- [x] Task: Implement Position and Grid extraction (2ff1c15)
    - [ ] Write tests for Position (x, y) and Layout Grids
    - [ ] Implement extraction logic
- [x] Task: Implement Constraints extraction (4823826)
    - [ ] Write tests for Horizontal and Vertical constraints
    - [ ] Implement extraction logic
- [x] Task: Implement basic application (Paste) for Phase 1 & 2 granules (39627d5)
    - [ ] Write tests for applying Rotation, Opacity, Corner Radius, Position, and Constraints
    - [ ] Implement application logic in `commands.ts`
- [x] Task: Conductor - User Manual Verification 'Phase 2: Geometry & Layout Constraints' (Protocol in workflow.md) (af94bb9)

## Phase 3: Auto Layout & Contextual Sizing [checkpoint: b1d5062]
- [x] Task: Implement Auto Layout extraction (70521d8)
- [x] Task: Implement Contextual Sizing logic (21b73f8)
- [x] Task: Implement Auto Layout and Sizing application (acc0d8c)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Auto Layout & Contextual Sizing' (Protocol in workflow.md) (b1d5062)

## Phase 4: Text Content & Shared Styles [checkpoint: 2305843]
- [x] Task: Implement Text Content and Styles logic (c3e8a96)
- [x] Task: Update Quick Action Manifest and Routing (74618e6)
- [x] Task: Conductor - User Manual Verification 'Phase 4: Text Content & Shared Styles' (Protocol in workflow.md) (2305843)
