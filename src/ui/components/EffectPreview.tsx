import React from 'react';

interface EffectPreviewProps {
  count?: number;
  styleName?: string;
}

export const EffectPreview: React.FC<EffectPreviewProps> = ({
  count,
  styleName,
}) => {
  if (count === undefined || count === 0) return null;

  return (
    <div className="effect-preview">
      <span className="effect-count">{count} {count === 1 ? 'effect' : 'effects'}</span>
      {styleName && <span className="effect-name">{styleName}</span>}
    </div>
  );
};
