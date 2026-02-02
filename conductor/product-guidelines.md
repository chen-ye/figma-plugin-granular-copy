# Product Guidelines

## Text & Communication Tone
- **Technical & Precise:** All messaging, labels, and status updates should be clear, technical, and accurate. Use terminology that aligns with Figma's native property names.
- **Example Status:** "Copied 3 Effects from [Node Name]" or "Pasted Corner Radius (4px) to [Node Name]".

## User Interface Design (Persistent UI)
- **Native Aesthetic:** The "Paste..." window must strictly adhere to Figma's official design system. This includes using the Inter font, standard UI colors (hex codes aligned with Figma's palette), and native button/input styling.
- **Contextual Preview:** The UI should feature a clear, high-fidelity preview of the source object (the "Copy" source) to provide visual confirmation of what is being pasted.
- **Integrated Experience:** The UI should feel like an extension of the Figma interface rather than a third-party overlay.

## Error Handling & Logic
- **Manual Command Validation:** If a user explicitly runs a specific paste command (e.g., "Paste Text Content") on a target that doesn't support it (e.g., a Rectangle), show an explicit warning/toast explaining why it failed.
- **Selective "Paste All":** When "Paste All" is executed, the operation should succeed for all compatible properties. Any properties that are incompatible with the target node should be silently excluded, but the final confirmation toast must explicitly list which granules were omitted.
- **Adaptive UI:** In the persistent "Paste..." UI, buttons for specific granules should be visually disabled (lowered opacity or greyed out) if they are not applicable to the currently selected target node.
