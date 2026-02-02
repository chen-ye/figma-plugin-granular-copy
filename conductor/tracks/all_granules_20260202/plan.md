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

## Phase 3: Auto Layout & Contextual Sizing [checkpoint: ]
- [ ] Task: Implement Auto Layout extraction
    - [ ] Write tests for Padding, Item Spacing, Alignment, and Wrapping
    - [ ] Implement extraction logic
- [ ] Task: Implement Contextual Sizing logic
    - [ ] Write tests for detecting Auto Layout parentage and extracting `layoutAlign`, `layoutGrow`, and sizing modes
    - [ ] Implement intelligent sizing extraction
- [ ] Task: Implement Auto Layout and Sizing application
    - [ ] Write tests for "Contextual Paste": apply raw size vs. sizing modes based on target parent
    - [ ] Implement application logic
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Auto Layout & Contextual Sizing' (Protocol in workflow.md)

## Phase 4: Text Content & Shared Styles [checkpoint: ]
- [ ] Task: Implement Text Content and Styles logic
    - [ ] Write tests for `characters` and `textStyleId` extraction
    - [ ] Write tests for individual font property extraction (fallback if no style ID)
    - [ ] Implement extraction and application (prioritizing Style ID)
- [ ] Task: Update Quick Action Manifest and Routing
    - [ ] Add all new granule commands to `manifest.json`
    - [ ] Update `src/main/main.ts` to route all new commands to `handlePasteCommand`
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Text Content & Shared Styles' (Protocol in workflow.md)
