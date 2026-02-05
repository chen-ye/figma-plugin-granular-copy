import type React from 'react';
import type { Paint } from '../../types';

interface SwatchProps {
  fill: Paint;
}

export const Swatch: React.FC<SwatchProps> = ({ fill }) => {
  return (
    <div className='color-swatch' style={getSwatchStyle(fill)}>
      {fill.type === 'IMAGE' && <span className='swatch-label'>IMG</span>}
    </div>
  );
};

function getSwatchStyle(fill: Paint): React.CSSProperties {
  const style: React.CSSProperties = {
    backgroundColor: 'transparent',
  };

  if (fill.type === 'SOLID') {
    const { r, g, b } = fill.color;
    const a = fill.opacity ?? 1;
    style.backgroundColor = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
  } else if (fill.type === 'GRADIENT_LINEAR') {
    const stops = fill.gradientStops;
    if (stops && stops.length >= 2) {
      const c1 = stops[0].color;
      const c2 = stops[stops.length - 1].color;
      style.background = `linear-gradient(to right, rgba(${c1.r * 255},${c1.g * 255},${c1.b * 255},${c1.a}), rgba(${c2.r * 255},${c2.g * 255},${c2.b * 255},${c2.a}))`;
    }
  } else if (fill.type === 'IMAGE') {
    style.backgroundColor = '#e0e0e0';
  }

  return style;
}
