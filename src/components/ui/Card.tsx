import React from 'react';
import { getComponentStyles } from '../../design-system';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
  onClick,
  interactive = false,
}) => {
  // Get design system styles
  const baseStyles = getComponentStyles('card', variant);
  
  // Size-specific styles
  const sizeStyles = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  // Combine styles
  const cardClasses = `
    ${baseStyles.backgroundColor ? `bg-[${baseStyles.backgroundColor}]` : ''}
    ${baseStyles.borderRadius ? `rounded-[${baseStyles.borderRadius}]` : ''}
    ${baseStyles.padding ? `p-[${baseStyles.padding}]` : ''}
    ${baseStyles.boxShadow ? `shadow-[${baseStyles.boxShadow}]` : ''}
    ${baseStyles.border ? `border-[${baseStyles.border}]` : ''}
    ${baseStyles.transition ? `transition-[${baseStyles.transition}]` : ''}
    ${sizeStyles[size]}
    ${interactive ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  // Hover styles for interactive cards
  const hoverStyles = interactive && baseStyles['&:hover'] ? `
    hover:shadow-[${baseStyles['&:hover'].boxShadow}]
    hover:transform-[${baseStyles['&:hover'].transform}]
  ` : '';

  const finalClasses = `${cardClasses} ${hoverStyles}`;

  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      className={finalClasses}
      onClick={onClick}
      type={interactive ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};

export default Card; 