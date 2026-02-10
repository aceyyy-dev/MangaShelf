import React from 'react';
import Icon from './Icon';

interface AvatarProps {
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, size = 'md', className = '' }) => {
  let sizeClasses = 'w-10 h-10'; // md
  let iconSize = 'text-xl';

  if (size === 'sm') { sizeClasses = 'w-8 h-8'; iconSize = 'text-lg'; }
  if (size === 'lg') { sizeClasses = 'w-12 h-12'; iconSize = 'text-2xl'; }
  if (size === 'xl') { sizeClasses = 'w-20 h-20'; iconSize = 'text-4xl'; }
  if (size === '2xl') { sizeClasses = 'w-28 h-28'; iconSize = 'text-5xl'; }

  if (!src) {
    return (
      <div className={`${sizeClasses} rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 ${className}`}>
        <Icon name="person" className={iconSize} />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt="Profile" 
      className={`${sizeClasses} rounded-full object-cover border-2 border-transparent ${className}`} 
    />
  );
};

export default Avatar;