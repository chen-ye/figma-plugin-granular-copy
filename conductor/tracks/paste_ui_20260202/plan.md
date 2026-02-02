# Implementation Plan - Persistent Paste Palette UI

## Phase 1: Main Process Updates & Thumbnail Capture [checkpoint: ]
- [x] Task: Implement Thumbnail Capture in Copy command (2486372)
    - [x] Update `src/main/commands.ts` to use `node.exportAsync` to generate a preview image
    - [x] Update `storage.ts` to support storing the Base64 image string
    - [x] Write unit tests for the updated copy flow
- [x] Task: Implement UI Messaging Bridge (2486372)
    - [x] Create `src/main/ui-handlers.ts` to handle messages from the React UI
    - [x] Route `COPY_SELECTION` and `PASTE_PROPERTY` messages to existing command logic
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Main Process Updates & Thumbnail Capture' (Protocol in workflow.md)

## Phase 2: UI Foundation & Data Loading [checkpoint: ]
- [ ] Task: Set up React UI structure
    - [ ] Create basic layout components in `src/ui/components/`
    - [ ] Implement `useFigmaData` hook to fetch and sync data from client storage
- [ ] Task: Implement Preview Header & Copy Button
    - [ ] Create `PreviewHeader` component to display the source image and name
    - [ ] Create `HeaderActions` with the "Copy Selection" button
    - [ ] Write tests for data synchronization between main and UI
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
