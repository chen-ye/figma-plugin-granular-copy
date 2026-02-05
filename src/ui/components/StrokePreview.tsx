import type React from 'react';
// Re-import PaintMetadata type if needed or defined inline
import type { Paint, PaintMetadata } from '../../types';
import { Badge } from './Badge';
import { Swatch } from './Swatch';

interface StrokePreviewProps {
  strokes: Paint[];
  metadata?: Record<number, PaintMetadata>;
  weight?: number;
  styleName?: string;
}

export const StrokePreview: React.FC<StrokePreviewProps> = ({
  strokes,
  metadata,
  weight,
  styleName,
}) => {
  if (!strokes || strokes.length === 0) return null;

  // We need to preserve original index to look up metadata
  const visibleStrokesWithIndex = strokes
    .map((stroke, index) => ({ stroke, index }))
    .filter(({ stroke }) => stroke.visible !== false)
    .slice(0, 4); // Max 4 swatches

  return (
    <div className='stroke-preview'>
      {weight !== undefined && (
        <span className='stroke-weight'>{weight}px</span>
      )}
      <div className='swatch-container'>
        {visibleStrokesWithIndex.map(({ stroke, index }) => {
          const swatch = <Swatch fill={stroke} />;
          const variableName = metadata?.[index]?.variableName;

          if (variableName) {
            return (
              <Badge key={index} swatch={swatch}>
                {variableName}
              </Badge>
            );
          }

          return <span key={index}>{swatch}</span>;
        })}
      </div>
      {styleName && <span className='stroke-name'>{styleName}</span>}
    </div>
  );
};
