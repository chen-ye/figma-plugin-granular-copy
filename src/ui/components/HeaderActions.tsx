import type React from 'react';

export const HeaderActions: React.FC = () => {
  const onCopy = () => {
    parent.postMessage({ pluginMessage: { type: 'COPY_SELECTION' } }, '*');
  };

  return (
    <div className='header-actions'>
      <button type='button' className='copy-button' onClick={onCopy}>
        Copy Selection
      </button>
    </div>
  );
};
