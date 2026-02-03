Property Previews Implementation

1. Backend Updates Update extraction.ts: When extracting properties, if a node
   has a Style ID (e.g., fillStyleId, textStyleId), resolve the style name using
   figma.getStyleById. Include Token Names: If a property is bound to a variable
   (token), attempt to resolve the variable name using
   figma.variables.getVariableById. Enrich Data: The extracted data object will
   now include companion fields like fillStyleName, strokeStyleName, etc.
2. Update PropertyButton Component Add an optional preview prop (type:
   React.ReactNode) to the PropertyButton interface. Style the button as a flex
   container with justify-content: space-between to place the preview on the
   right.
3. Create Preview Components Create a set of small functional components to
   visualize data:

ColorPreview: For fills and strokes. If a Style Name exists (e.g.,
"Primary/Brand"), display it in tertiary text. Otherwise, display a row of small
color swatches (circles). ValuePreview: For scalar values like opacity,
cornerRadius, rotation. Displays the numeric value (e.g., "50%", "4px", "45°").
TypographyPreview: For text properties. If a Text Style is applied, show its
name. Otherwise, show a compact summary: Inter Regular 12. StrokePreview: Show
the weight (e.g., "2px") and the style name if applicable. EffectPreview: Show
the style name if it exists, otherwise a generic count (e.g., "2 Effects"). 4.
Integrate into App.tsx Pass the appropriate preview component to each
PropertyButton. Pass both the raw property data and the resolved names from the
data object. 5. Implementation Details by Property Fills/Strokes: Use CSS
background-color for swatches. Handle max 3. Corner Radius: Display as a single
number if all corners are equal, otherwise show "R: 4, 8, ..." abbreviated.
Typography: Concatenate fontName.family, fontName.style, and fontSize. Effects:
Display the first effect's type (e.g., "Drop Shadow") if no style name.
