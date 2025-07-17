import React from 'react';
import Mascots from './Mascots';

interface LoadingMascotsProps {
  type?: 'loading' | 'processing' | 'thinking' | 'achievement';
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingMascots: React.FC<LoadingMascotsProps> = ({
  type = 'loading',
  message,
  size = 'medium',
  className = ''
}) => {
  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'loading':
        return 'Laden...';
      case 'processing':
        return 'Verwerken...';
      case 'thinking':
        return 'Denken...';
      case 'achievement':
        return 'Gefeliciteerd!';
      default:
        return 'Laden...';
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'achievement':
        return 'achievement';
      case 'thinking':
        return 'loading';
      default:
        return 'loading';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="mb-6">
        <Mascots 
          variant={getVariant()}
          size={size}
        />
      </div>
      
      <div className="text-center">
        <p className="text-text-primary dark:text-text-dark-primary text-lg font-medium mb-2">
          {getMessage()}
        </p>
        
        {type === 'loading' && (
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-japanese-red rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-japanese-red rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-japanese-red rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
        
        {type === 'processing' && (
          <div className="w-32 h-2 bg-light-tertiary dark:bg-dark-tertiary rounded-full overflow-hidden">
            <div className="h-full bg-accent-orange dark:bg-accent-orange-dark rounded-full animate-pulse"></div>
          </div>
        )}
        
        {type === 'thinking' && (
          <div className="flex justify-center space-x-1">
            <div className="w-1 h-1 bg-accent-yellow dark:bg-accent-yellow-dark rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-accent-yellow dark:bg-accent-yellow-dark rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-accent-yellow dark:bg-accent-yellow-dark rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        
        {type === 'achievement' && (
          <div className="flex justify-center">
            <div className="text-accent-yellow dark:text-accent-yellow-dark text-2xl animate-bounce">
              ⭐
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingMascots; 