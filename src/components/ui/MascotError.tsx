import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import HybridMascots from './HybridMascots';

interface MascotErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  mascotVariant?: string;
  mascotContext?: string;
  className?: string;
}

const MascotError: React.FC<MascotErrorProps> = ({
  title = "❌ Error",
  message,
  onRetry,
  retryText = "Try Again",
  mascotVariant = "worried",
  mascotContext = "error",
  className = ""
}) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'} ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <HybridMascots
            type="emotions"
            size="large"
            variant={mascotVariant}
            context={mascotContext}
          />
          
          <div className={`p-6 rounded-2xl mt-6 ${theme === 'dark' ? 'bg-japanese-red/10 border border-japanese-red/20' : 'bg-japanese-red/5 border border-japanese-red/20'}`}>
            <div className={`font-semibold text-japanese-red mb-2 text-center`}>
              {title}
            </div>
            <p className={`text-sm text-center ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {message}
            </p>
          </div>
          
          {onRetry && (
            <button 
              className={`px-6 py-3 bg-japanese-red text-white rounded-nav font-semibold hover:bg-japanese-red-dark transition-colors duration-300 mt-4`}
              onClick={onRetry}
            >
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MascotError; 