import type React from 'react';

interface PositionPreviewProps {
  x?: number;
  y?: number;
}

export const PositionPreview: React.FC<PositionPreviewProps> = ({ x, y }) => {
  if (x === undefined && y === undefined) return null;

  return (
    <div className='position-preview'>
      {x !== undefined && (
        <span className='position-value'>X: {Math.round(x)}</span>
      )}
      {y !== undefined && (
        <span className='position-value'>Y: {Math.round(y)}</span>
      )}
    </div>
  );
};
