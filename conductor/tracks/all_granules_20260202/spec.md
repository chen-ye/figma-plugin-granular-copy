# Specification - Implement All Property Granules

This track completes the core copy/paste logic by implementing all remaining design property "granules" defined in the product vision.

## Overview
Expand the existing infrastructure to support the full range of Figma design properties, ensuring intelligent handling of contextual sizing, shared styles, and node compatibility.

## Functional Requirements
- **Comprehensive Extraction:** Update extraction logic to capture:
    - **Position:** `x`, `y`.
    - **Rotation:** `rotation`.
    - **Size & Dimensions:** `width`, `height`.
    - **Contextual Sizing:** Capture `layoutAlign`, `layoutGrow`, `primaryAxisSizingMode`, `counterAxisSizingMode`.
    - **Corner Radius:** `cornerRadius`, `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius`.
    - **Opacity:** `opacity`.
    - **Auto Layout:** `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`, `itemSpacing`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `layoutMode`, `layoutWrap`.
    - **Layout Grids:** `layoutGrids`.
    - **Constraints:** `constraints`.
    - **Layer Blending:** `blendMode`.
    - **Text Content:** `characters`.
    - **Text Styles:** `textStyleId` (primary), or individual properties (fontName, fontSize, lineHeight, letterSpacing, paragraphSpacing, paragraphIndent, textCase, textDecoration) if no style ID exists.
    - **Export Settings:** `exportSettings`.

- **Intelligent Application (Paste):**
    - **Style ID First:** Prioritize applying `textStyleId` for text nodes.
    - **Contextual Sizing:** If source and target are in Auto Layout frames, apply sizing modes (`Hug`, `Fill`, `Fixed`) instead of raw dimensions.
    - **Compatibility Feedback:** Partial application is allowed. The confirmation toast must explicitly list which granules were applied and which were skipped due to node incompatibility.

## Technical Requirements
- **Property Mapping:** Extend the `ALL_GRANULES` list and implementation in `commands.ts`.
- **Node Type Validation:** Use TypeScript type guards to safely check if a node supports a specific property before reading or writing.
- **Client Storage:** Ensure the serializable data structure handles complex objects like `fontName` or `layoutGrids` (arrays of objects).

## Acceptance Criteria
- [ ] All defined granules can be copied from a source node.
- [ ] Individual paste commands (Quick Actions) work for each granule.
- [ ] Contextual sizing logic correctly switches between raw size and sizing modes.
- [ ] Confirmation toasts accurately reflect applied/skipped granules.
- [ ] Unit tests cover extraction and application for all new granules.
