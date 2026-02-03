import type React from 'react';
import { Badge } from './Badge';

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
    <div className='effect-preview'>
      <span className='effect-count'>
        {count} {count === 1 ? 'effect' : 'effects'}
      </span>
      {styleName && <Badge>{styleName}</Badge>}
    </div>
  );
};
