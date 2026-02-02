import React from 'react';

interface PreviewHeaderProps {
  name: string;
  preview: string;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  name,
  preview,
}) => {
  return (
    <div className='preview-header'>
      <div className='preview-thumbnail'>
        {preview ? (
          <img src={`data:image/png;base64,${preview}`} alt={name} />
        ) : (
          <div className='preview-placeholder' />
        )}
      </div>
      <div className='preview-info'>
        <span className='node-name'>{name || 'No selection'}</span>
      </div>
    </div>
  );
};
