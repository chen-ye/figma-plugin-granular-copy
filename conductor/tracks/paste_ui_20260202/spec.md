# Specification - Persistent Paste Palette UI

This track implements the "Paste..." persistent UI window, providing a visual way to interactively paste granular properties.

## Overview
A reactive UI panel built with React that displays a preview of the copied source object and offers a categorized grid of buttons to immediately apply specific properties to the current selection.

## Functional Requirements
- **Automatic Data Loading:** Upon launch, the UI fetches the last copied property set and thumbnail from `figma.clientStorage`.
- **Integrated Copy:** A "Copy Selection" button above the preview area allows users to update the source data directly from the UI without closing it.
- **Visual Preview:** Displays a high-fidelity image (Base64) of the source object at the top of the palette.
- **Categorized Property Grid:**
    - **Visuals:** Fills, Strokes, Effects, Opacity, Corner Radius, Blend Mode.
    - **Layout:** Position, Size, Auto Layout, Constraints, Grids.
    - **Content:** Text Content, Text Styles.
    - **Misc:** Export Settings.
- **Instant Application:** Clicking any property button sends a message to the main process to execute the paste operation for that specific granule on the current selection.
- **Dynamic State:** Buttons should be visually disabled if:
    - The property doesn't exist in the copied source data.
    - The property is incompatible with the currently selected target(s).
- **Persistence:** The window remains open until manually closed by the user, allowing for multiple consecutive paste operations.

## Technical Requirements
- **Message Bridge:** Use `figma.ui.postMessage` and `figma.ui.onmessage` to communicate between the React UI and the Figma main process.
- **Thumbnail Capture:** Update the `Copy` command logic to use `exportAsync` to generate a Base64 preview image.
- **React Components:**
    - `HeaderActions`: Contains the "Copy Selection" button.
    - `PreviewHeader`: Displays the source image and name.
    - `PropertyButton`: A reusable button component adhering to Figma's design system.
    - `PropertyCategory`: A wrapper for grouping buttons.
- **Native Aesthetic:** Use Inter font and hex colors matching Figma's UI.

## Acceptance Criteria
- [ ] Running the "Paste..." Quick Action opens the palette.
- [ ] The "Copy Selection" button updates the stored data and the displayed preview immediately.
- [ ] The palette correctly displays the last copied object's preview.
- [ ] Clicking property buttons immediately applies them to selection.
- [ ] Buttons reflect the availability/compatibility of properties.
- [ ] The UI remains responsive and follows Figma's design guidelines.
