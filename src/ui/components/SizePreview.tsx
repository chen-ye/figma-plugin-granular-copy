import type React from 'react';

interface SizePreviewProps {
  width?: number;
  height?: number;
}

export const SizePreview: React.FC<SizePreviewProps> = ({ width, height }) => {
  if (width === undefined && height === undefined) return null;

  const w = width !== undefined ? Math.round(width) : '?';
  const h = height !== undefined ? Math.round(height) : '?';

  return <span className='size-preview'>{`${w} × ${h}`}</span>;
};
