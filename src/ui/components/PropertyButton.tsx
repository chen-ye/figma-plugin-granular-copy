import React from 'react';

interface PropertyButtonProps {
  label: string;
  granules: string[];
  available: boolean;
  onPaste: (granules: string[]) => void;
}

export const PropertyButton: React.FC<PropertyButtonProps> = ({
  label,
  granules,
  available,
  onPaste,
}) => {
  return (
    <button
      className='property-button'
      disabled={!available}
      onClick={() => onPaste(granules)}
    >
      {label}
    </button>
  );
};
