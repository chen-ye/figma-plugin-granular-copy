import type React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  swatch?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, swatch }) => {
  return (
    <span className='variable-badge'>
      {swatch}
      <span className='variable-badge-text'>
        <bdi>{children}</bdi>
      </span>
    </span>
  );
};
