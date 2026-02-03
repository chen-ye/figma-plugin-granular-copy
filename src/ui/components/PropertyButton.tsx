import React from 'react';

interface PropertyButtonProps {
  label: string;
  granules: string[];
  available: boolean;
  onPaste: (granules: string[]) => void;
  preview?: React.ReactNode;
}

export const PropertyButton: React.FC<PropertyButtonProps> = ({
  label,
  granules,
  available,
  onPaste,
  preview,
}) => {
  return (
    <button
      className='property-button'
      disabled={!available}
      onClick={() => onPaste(granules)}
    >
      <span>{label}</span>
      {preview && <div className='property-preview'>{preview}</div>}
    </button>
  );
};
