import React from 'react';
import Icon, { IconName } from './Icon';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label?: string;
  iconClassName?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, iconClassName = 'w-5 h-5', className, ...props }) => {
  return (
    <button
      {...props}
      className={`flex items-center justify-center p-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Icon name={icon} className={iconClassName} />
      {label && <span className="ml-2">{label}</span>}
    </button>
  );
};

export default IconButton;
