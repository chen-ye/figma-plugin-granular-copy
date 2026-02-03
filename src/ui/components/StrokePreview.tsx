import type React from 'react';

interface StrokePreviewProps {
  weight?: number;
  styleName?: string;
  variableName?: string;
}

export const StrokePreview: React.FC<StrokePreviewProps> = ({
  weight,
  styleName,
  variableName,
}) => {
  return (
    <div className='stroke-preview'>
      {weight !== undefined && (
        <span className='stroke-weight'>{weight}px</span>
      )}
      {(styleName || variableName) && (
        <span className='stroke-name'>{styleName || variableName}</span>
      )}
    </div>
  );
};
