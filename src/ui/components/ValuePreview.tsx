import type React from 'react';

interface ValuePreviewProps {
  value: number | string;
  unit?: string;
}

export const ValuePreview: React.FC<ValuePreviewProps> = ({
  value,
  unit = '',
}) => {
  let displayValue = value;

  if (typeof value === 'number') {
    displayValue = parseFloat(value.toFixed(2));
  }

  return (
    <span className='value-preview'>
      {displayValue}
      {unit}
    </span>
  );
};
