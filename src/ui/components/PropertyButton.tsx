import type React from 'react';

interface PropertyButtonProps {
  label: string;
  granules: string[];
  available: boolean;
  onPaste: (granules: string[]) => void;
  preview?: React.ReactNode;
  className?: string;
}

export const PropertyButton: React.FC<PropertyButtonProps> = ({
  label,
  granules,
  available,
  onPaste,
  preview,
  className = '',
}) => {
  return (
    <button
      type='button'
      className={`property-button ${className}`.trim()}
      disabled={!available}
      onClick={() => onPaste(granules)}
    >
      <span>{label}</span>
      {preview && <div className='property-preview'>{preview}</div>}
    </button>
  );
};
