import type React from 'react';
import type { ExtendedPaint } from '../../types';
import { Badge } from './Badge';
import { Swatch } from './Swatch';

interface StrokePreviewProps {
  strokes: ExtendedPaint[];
  weight?: number;
  styleName?: string;
}

export const StrokePreview: React.FC<StrokePreviewProps> = ({
  strokes,
  weight,
  styleName,
}) => {
  if (!strokes || strokes.length === 0) return null;

  const visibleStrokes = strokes
    .filter((stroke) => stroke.visible !== false)
    .slice(0, 4); // Max 4 swatches

  return (
    <div className='stroke-preview'>
      {weight !== undefined && (
        <span className='stroke-weight'>{weight}px</span>
      )}
      <div className='swatch-container'>
        {visibleStrokes.map((stroke, index) => {
          const swatch = <Swatch fill={stroke} />;

          if (stroke.variableName) {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: No unique ID
              <Badge key={index} swatch={swatch}>
                {stroke.variableName}
              </Badge>
            );
          }

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: No unique ID
            <span key={index}>{swatch}</span>
          );
        })}
      </div>
      {styleName && <span className='stroke-name'>{styleName}</span>}
    </div>
  );
};
