import type React from 'react';

interface TypographyPreviewProps {
  textStyleName?: string;
  fontName?: {
    family: string;
    style: string;
  };
  fontSize?: number;
}

export const TypographyPreview: React.FC<TypographyPreviewProps> = ({
  textStyleName,
  fontName,
  fontSize,
}) => {
  if (textStyleName) {
    return <span className='typography-preview'>{textStyleName}</span>;
  }

  const parts = [];
  if (fontName?.family) parts.push(fontName.family);
  if (fontName?.style) parts.push(fontName.style);
  if (fontSize) parts.push(Math.round(fontSize));

  if (parts.length === 0) return null;

  return <span className='typography-preview'>{parts.join(' ')}</span>;
};
