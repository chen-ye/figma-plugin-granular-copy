# Specification: Property Previews

## Overview
Enhance the "Paste..." UI by adding visual previews for each property granule. This allows users to see exactly what they are about to paste (e.g., the specific color, font, or numeric value) and provides context by displaying Figma Style and Variable names.

## Functional Requirements

### 1. Data Enrichment (Backend)
- **Style Resolution:** When extracting properties from the source node, resolve `fillStyleId`, `strokeStyleId`, `textStyleId`, and `effectStyleId` using `figma.getStyleById`.
- **Variable Resolution:** If a property is bound to a variable, resolve its name using `figma.variables.getVariableById`.
- **Mixed Property Handling:** For properties returning `figma.mixed`, identify and extract the "dominant" value (e.g., the value used at the start of the range) to be used for both the preview and the subsequent paste operation.
- **Companion Fields:** Enrich the data object sent to the UI with companion fields:
    - `fillStyleName`, `strokeStyleName`, etc.
    - `fillVariableName`, `strokeVariableName`, etc.

### 2. UI Components (Frontend)
- **`PropertyButton` Enhancement:**
    - Add an optional `preview` prop (type: `React.ReactNode`).
    - Update layout to be a flex container with `justify-content: space-between`, placing the preview on the right.
- **Preview Component Library:**
    - **`ColorPreview`:** Displays up to 4 small color swatches (rounded rectangles, in the style of Figma swatches). If a Style Name or Variable Name is present, it is displayed in tertiary text alongside the swatches. (Priority: Style > Variable).
    - **`ValuePreview`:** Displays scalar values with units (e.g., "4px", "50%", "45°").
    - **`TypographyPreview`:** Displays the Style Name if present. Otherwise, displays a compact summary (e.g., "Inter Bold 12").
    - **`StrokePreview`:** Displays the stroke weight and style name.
    - **`EffectPreview`:** Displays the effect type (e.g., "Drop Shadow") and style name.

### 3. Error Handling & Fallbacks
- **Missing Styles:** If a Style ID exists but cannot be resolved, display the raw value and the suffix "(Unknown Style)".
- **Priority:** For display names, use the following precedence: **Style Name > Variable Name > Raw Value**.

## Acceptance Criteria
- [ ] The "Paste..." UI displays a preview for every supported granule.
- [ ] Previews correctly show Figma Style names when styles are applied.
- [ ] Previews correctly show Variable names when styles are absent but variables are bound.
- [ ] Mixed properties show the dominant value instead of "Mixed".
- [ ] Clicking a property button still correctly selects it for pasting.
- [ ] The visual style of previews matches Figma's native aesthetic (tertiary text, small swatches).

## Out of Scope
- Detailed editing of property values within the preview.
- Multi-node source extraction (maintaining single-node source model).
