# Specification - Granular Core Infrastructure

This track focuses on establishing the data serialization bridge between "Copy" and "Paste" operations and implementing the first set of Quick Action commands.

## Functional Requirements
- **Data Serialization:** Since Quick Actions start fresh plugin instances, copied properties must be stored using `figma.clientStorage`.
- **Command Hierarchy:** Implement `manifest.json` entries for `Copy`, `Paste Fills`, `Paste Strokes`, and `Paste Effects`.
- **Variable Support:** Serialization must include variable aliases (Variable IDs) to support "paste-by-reference".
- **Node Validation:** Basic checks to ensure target nodes support the properties being pasted.

## Technical Requirements
- **Client Storage:** Use `figma.clientStorage.setAsync` and `getAsync`.
- **Serialization Layer:** A utility to map native Figma node properties to a JSON-serializable format.
- **Manifest Configuration:** Definition of `menu` and `parameters` (if needed) for Quick Action discovery.
