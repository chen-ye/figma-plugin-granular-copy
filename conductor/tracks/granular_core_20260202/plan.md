# Implementation Plan - Granular Core Infrastructure

## Phase 1: Scaffolding & Manifest [checkpoint: 085943d]
- [x] Task: Set up the project structure with Vite and React (755141a)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Scaffolding & Manifest' (Protocol in workflow.md) (085943d)

## Phase 2: Serialization Engine
- [ ] Task: Implement the Property Extraction logic
    - [ ] Write unit tests for extracting Fills, Strokes, and Effects including Variable bindings
    - [ ] Implement utility to read properties from a selected node
- [ ] Task: Implement Client Storage persistence
    - [ ] Create a storage service to save/load JSON data to `figma.clientStorage`
    - [ ] Write tests for storage serialization/deserialization
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Serialization Engine' (Protocol in workflow.md)

## Phase 3: Quick Action Implementation
- [ ] Task: Implement the "Copy" command logic
    - [ ] Handle selection validation (ensure 1 node)
    - [ ] Execute extraction and save to storage
- [ ] Task: Implement granular "Paste" commands
    - [ ] Write tests for selective property application
    - [ ] Implement `Paste Fills`, `Paste Strokes`, and `Paste Effects`
    - [ ] Handle property exclusion logic with confirmation toasts
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Quick Action Implementation' (Protocol in workflow.md)
