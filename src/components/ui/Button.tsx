import React from 'react';
import { getComponentStyles } from '../../design-system';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  // Get design system styles
  const baseStyles = getComponentStyles('button', variant);
  
  // Size-specific styles
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  // Combine styles
  const buttonClasses = `
    ${baseStyles.backgroundColor ? `bg-[${baseStyles.backgroundColor}]` : ''}
    ${baseStyles.color ? `text-[${baseStyles.color}]` : ''}
    ${baseStyles.borderRadius ? `rounded-[${baseStyles.borderRadius}]` : ''}
    ${baseStyles.padding ? `p-[${baseStyles.padding}]` : ''}
    ${baseStyles.fontSize ? `text-[${baseStyles.fontSize}]` : ''}
    ${baseStyles.fontWeight ? `font-[${baseStyles.fontWeight}]` : ''}
    ${baseStyles.boxShadow ? `shadow-[${baseStyles.boxShadow}]` : ''}
    ${baseStyles.border ? `border-[${baseStyles.border}]` : ''}
    ${baseStyles.cursor ? `cursor-[${baseStyles.cursor}]` : ''}
    ${baseStyles.transition ? `transition-[${baseStyles.transition}]` : ''}
    ${sizeStyles[size]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  // Hover styles
  const hoverStyles = baseStyles['&:hover'] ? `
    hover:bg-[${baseStyles['&:hover'].backgroundColor}]
    hover:shadow-[${baseStyles['&:hover'].boxShadow}]
    hover:transform-[${baseStyles['&:hover'].transform}]
  ` : '';

  // Active styles
  const activeStyles = baseStyles['&:active'] ? `
    active:transform-[${baseStyles['&:active'].transform}]
    active:shadow-[${baseStyles['&:active'].boxShadow}]
  ` : '';

  const finalClasses = `${buttonClasses} ${hoverStyles} ${activeStyles}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClasses}
    >
      {children}
    </button>
  );
};

export default Button; 