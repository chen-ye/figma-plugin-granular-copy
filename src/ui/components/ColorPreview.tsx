import type React from 'react';
import type { ExtendedPaint } from '../../types';

interface ColorPreviewProps {
  fills: ExtendedPaint[];
  styleName?: string;
  variableName?: string;
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({
  fills,
  styleName,
  variableName,
}) => {
  if (!fills || fills.length === 0) return null;

  const visibleFills = fills
    .filter((fill) => fill.visible !== false)
    .slice(0, 4); // Max 4 swatches

  return (
    <div className='color-preview'>
      <div className='swatch-container'>
        {visibleFills.map((fill, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: Color fills have no unique ID
            key={index}
            className='color-swatch'
            style={getSwatchStyle(fill)}
          >
            {fill.type === 'IMAGE' && <span className='swatch-label'>IMG</span>}
          </div>
        ))}
      </div>
      {(styleName || variableName) && (
        <span className='color-name'>{styleName || variableName}</span>
      )}
    </div>
  );
};

function getSwatchStyle(fill: ExtendedPaint): React.CSSProperties {
  const style: React.CSSProperties = {
    backgroundColor: 'transparent',
  };

  if (fill.type === 'SOLID') {
    const { r, g, b } = fill.color;
    const a = fill.opacity ?? 1;
    style.backgroundColor = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
  } else if (fill.type === 'GRADIENT_LINEAR') {
    // Simple approximation for gradient preview
    const stops = fill.gradientStops;
    if (stops && stops.length >= 2) {
      const c1 = stops[0].color;
      const c2 = stops[stops.length - 1].color;
      style.background = `linear-gradient(to right, rgba(${c1.r * 255},${c1.g * 255},${c1.b * 255},${c1.a}), rgba(${c2.r * 255},${c2.g * 255},${c2.b * 255},${c2.a}))`;
    }
  } else if (fill.type === 'IMAGE') {
    style.backgroundColor = '#e0e0e0'; // Placeholder gray
  }

  return style;
}
