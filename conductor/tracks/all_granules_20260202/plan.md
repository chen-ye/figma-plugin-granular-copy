# Implementation Plan - Implement All Property Granules

## Phase 1: Visual & Metadata Extraction [checkpoint: ]
- [x] Task: Expand Extraction logic for basic visuals (f4138f9)
    - [ ] Write tests for extracting Rotation, Opacity, Blend Mode, and Export Settings
    - [ ] Implement extraction for these properties in `extraction.ts`
- [x] Task: Implement Corner Radius logic (4f9562d)
    - [ ] Write tests for both uniform and individual corner radius extraction
    - [ ] Implement robust corner radius extraction (handling `cornerRadius` vs individual corners)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Visual & Metadata Extraction' (Protocol in workflow.md)

## Phase 2: Geometry & Layout Constraints [checkpoint: ]
- [ ] Task: Implement Position and Grid extraction
    - [ ] Write tests for Position (x, y) and Layout Grids
    - [ ] Implement extraction logic
- [ ] Task: Implement Constraints extraction
    - [ ] Write tests for Horizontal and Vertical constraints
    - [ ] Implement extraction logic
- [ ] Task: Implement basic application (Paste) for Phase 1 & 2 granules
    - [ ] Write tests for applying Rotation, Opacity, Corner Radius, Position, and Constraints
    - [ ] Implement application logic in `commands.ts`
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Geometry & Layout Constraints' (Protocol in workflow.md)

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
