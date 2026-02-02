# Initial Concept

A figma plugin (https://developers.figma.com/docs/plugins/) which allows you to copy properties from a selected object, and paste them in a granular way. The primary interaction model should be via the Quick Action Bar (figma.command), exposing a hierarchical list of command and subcommands. There is a single "Copy" subcommand, and "Paste" subcommands for each kind of property to paste, as well as a "Paste All" subcommand, and a "Paste..." subcommand which opens up a persistant UI which contains a picture of the object which is being copied from, as well as buttons to paste each kind of subproperty. Example workflow: 1. Run Granular/Copy with the object to copy properties from selected. 2. Run Granular/Paste Effects with the object to copy properties to selected.

# Target Audience
- **Power Users:** Designers who prioritize speed, precision, and efficiency in their workflow.

# Core Goals
- **Seamless Workflow:** Deliver a fluid, keyboard-centric experience primarily driven by Figma's Quick Actions (Command/Ctrl + /).
- **Precision Control:** Empower users to selectively apply specific design properties (granules) without unwanted overrides.

# Granular Properties
The plugin will support the following distinct "granules" for copying and pasting. Variable bindings will be preserved where applicable (paste-by-reference).

## Supported Granules
- **Position:** X, Y coordinates.
- **Size & Dimensions:** Width, Height.
    - *Contextual Behavior:* If both source and target are children of an Auto Layout frame, pasting "Size" will apply the **Sizing Mode** (Hug/Fill/Fixed) instead of the literal pixel dimensions.
- **Rotation:** Rotation angle.
- **Fills:** Solid colors, gradients, images.
- **Strokes:** Stroke weight, color, style (solid/dashed), alignment (center/inside/outside).
- **Effects:** Drop shadows, inner shadows, layer blurs, background blurs.
- **Corner Radius:** Independent and uniform corner smoothing.
- **Opacity:** Layer opacity.
- **Auto Layout:**
    - Padding (horizontal, vertical, individual)
    - Gap (item spacing)
    - Alignment & Distribution
    - Wrapping
- **Layout Grids:** Column, row, and grid layouts.
- **Constraints:** Horizontal and vertical constraints (Left, Right, Scale, Center).
- **Layer Blending:** Blend modes (Multiply, Screen, Overlay, etc.).
- **Text Content:** The raw string value.
- **Text Styles:** Monolithic text properties (Font family, weight, size, line height, letter spacing, paragraph spacing).
- **Export Settings:** format (PNG/SVG/etc) and scale factors.

## Implementation Note
- **Variable Bindings:** If a source property (e.g., a Fill color) is bound to a variable, the paste operation will apply that variable binding to the target, preserving the reference system rather than just the raw value.