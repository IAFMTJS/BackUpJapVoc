import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import HybridMascots from './HybridMascots';

interface MascotEmptyProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  mascotVariant?: string;
  mascotContext?: string;
  className?: string;
}

const MascotEmpty: React.FC<MascotEmptyProps> = ({
  title,
  message,
  actionText,
  onAction,
  mascotVariant = "curious",
  mascotContext = "empty",
  className = ""
}) => {
  const { theme } = useTheme();

  return (
    <div className={`text-center py-12 ${className}`}>
      <HybridMascots
        type="emotions"
        size="large"
        variant={mascotVariant}
        context={mascotContext}
      />
      
      <h3 className={`text-xl font-bold mb-2 mt-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
        {title}
      </h3>
      
      <p className={`mb-4 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
        {message}
      </p>
      
      {actionText && onAction && (
        <button 
          className={`px-6 py-3 bg-japanese-red text-white rounded-button hover:bg-japanese-redLight shadow-button hover:shadow-button-hover transition-all duration-300`}
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default MascotEmpty; 