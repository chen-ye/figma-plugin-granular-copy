import type React from 'react';
import type { ExtendedPaint } from '../../types';
import { Badge } from './Badge';
import { Swatch } from './Swatch';

interface ColorPreviewProps {
  fills: ExtendedPaint[];
  styleName?: string;
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({
  fills,
  styleName,
}) => {
  if (!fills || fills.length === 0) return null;

  const visibleFills = fills
    .filter((fill) => fill.visible !== false)
    .slice(0, 4); // Max 4 swatches

  return (
    <div className='color-preview'>
      <div className='swatch-container'>
        {visibleFills.map((fill, index) => {
          const swatch = <Swatch fill={fill} />;

          if (fill.variableName) {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: No unique ID
              <Badge key={index} swatch={swatch}>
                {fill.variableName}
              </Badge>
            );
          }

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: No unique ID
            <span key={index}>{swatch}</span>
          );
        })}
      </div>
      {styleName && <span className='color-name'>{styleName}</span>}
    </div>
  );
};
