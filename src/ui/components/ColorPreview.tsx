import type React from 'react';
// Re-import PaintMetadata type if needed or defined inline
import type { Paint, PaintMetadata } from '../../types';
import { Badge } from './Badge';
import { Swatch } from './Swatch';

interface ColorPreviewProps {
  fills: Paint[];
  metadata?: Record<number, PaintMetadata>;
  styleName?: string;
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({
  fills,
  metadata,
  styleName,
}) => {
  if (!fills || fills.length === 0) return null;

  // We need to preserve original index to look up metadata
  const visibleFillsWithIndex = fills
    .map((fill, index) => ({ fill, index }))
    .filter(({ fill }) => fill.visible !== false)
    .slice(0, 4); // Max 4 swatches

  return (
    <div className='color-preview'>
      <div className='swatch-container'>
        {visibleFillsWithIndex.map(({ fill, index }) => {
          const swatch = <Swatch fill={fill} />;
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
      {styleName && <span className='color-name'>{styleName}</span>}
    </div>
  );
};
