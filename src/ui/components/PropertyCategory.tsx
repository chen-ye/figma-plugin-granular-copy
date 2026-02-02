import React from 'react';

interface PropertyCategoryProps {
  title: string;
  children: React.ReactNode;
}

export const PropertyCategory: React.FC<PropertyCategoryProps> = ({
  title,
  children,
}) => {
  return (
    <div className='property-category'>
      <h3 className='category-title'>{title}</h3>
      <div className='category-grid'>{children}</div>
    </div>
  );
};
