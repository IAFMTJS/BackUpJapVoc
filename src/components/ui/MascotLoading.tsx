import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import HybridMascots from './HybridMascots';

interface MascotLoadingProps {
  message?: string;
  subMessage?: string;
  mascotVariant?: string;
  mascotContext?: string;
  showSpinner?: boolean;
  className?: string;
}

const MascotLoading: React.FC<MascotLoadingProps> = ({
  message = "Loading...",
  subMessage = "Please wait a moment",
  mascotVariant = "thinking",
  mascotContext = "loading",
  showSpinner = true,
  className = ""
}) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'} ${className}`}>
      <div className="flex flex-col items-center">
        <HybridMascots
          type="emotions"
          size="large"
          variant={mascotVariant}
          context={mascotContext}
        />
        
        {showSpinner && (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-japanese-red mt-6"></div>
        )}
        
        <h2 className={`text-xl mt-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          {message}
        </h2>
        
        {subMessage && (
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default MascotLoading; 