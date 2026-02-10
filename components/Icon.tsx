import React from 'react';

interface IconProps {
  name: string;
  type?: 'filled' | 'outlined' | 'round' | 'sharp' | 'symbol';
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, type = 'filled', className = '' }) => {
  let fontClass = 'material-icons';
  if (type === 'outlined') fontClass = 'material-icons-outlined';
  if (type === 'round') fontClass = 'material-icons-round';
  if (type === 'sharp') fontClass = 'material-icons-sharp';
  if (type === 'symbol') fontClass = 'material-symbols-outlined';

  return <span className={`${fontClass} ${className}`}>{name}</span>;
};

export default Icon;
