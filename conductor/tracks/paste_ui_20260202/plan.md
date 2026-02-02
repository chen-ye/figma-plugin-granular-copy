# Implementation Plan - Persistent Paste Palette UI

## Phase 1: Main Process Updates & Thumbnail Capture [checkpoint: 9061cde]
- [x] Task: Implement Thumbnail Capture in Copy command (2486372)
- [x] Task: Implement UI Messaging Bridge (2486372)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Main Process Updates & Thumbnail Capture' (Protocol in workflow.md) (9061cde)

## Phase 2: UI Foundation & Data Loading [checkpoint: ]
- [x] Task: Set up React UI structure (0535123)
    - [ ] Create basic layout components in `src/ui/components/`
    - [ ] Implement `useFigmaData` hook to fetch and sync data from client storage
- [x] Task: Implement Preview Header & Copy Button (01c04d5)
    - [x] Create `PreviewHeader` component to display the source image and name
    - [x] Create `HeaderActions` with the "Copy Selection" button
    - [x] Write tests for data synchronization between main and UI
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Foundation & Data Loading' (Protocol in workflow.md)

## Phase 3: Categorized Property Grid [checkpoint: ]
- [ ] Task: Implement Property Buttons & Categories
    - [ ] Create `PropertyButton` component with disabled states based on data availability
    - [ ] Create `PropertyCategory` groups (Visuals, Layout, Content, Misc)
    - [ ] Implement click handlers to send paste messages to main
- [ ] Task: Implement Adaptive Button States
    - [ ] Add logic to listen for selection changes in Figma and update button compatibility states
    - [ ] Write tests for dynamic button enabling/disabling
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Categorized Property Grid' (Protocol in workflow.md)

## Phase 4: Styling & Final Integration [checkpoint: ]
- [ ] Task: Apply Figma Native Styling
    - [ ] Style all components using Figma's official hex codes and Inter font
    - [ ] Ensure the palette follows "Native Aesthetic" guidelines (spacing, borders, hover states)
- [ ] Task: Refine Window Management
    - [ ] Set appropriate initial window size
    - [ ] Ensure "Paste..." Quick Action opens the UI without closing the main plugin process
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Styling & Final Integration' (Protocol in workflow.md)
