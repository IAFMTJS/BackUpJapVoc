import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Mascots from '../components/ui/Mascots';
import LoadingMascots from '../components/ui/LoadingMascots';

const MascotTest: React.FC = () => {
  const { theme, toggleTheme, getThemeClasses } = useTheme();
  const classes = getThemeClasses();
  const [currentVariant, setCurrentVariant] = useState<'welcome' | 'loading' | 'achievement' | 'error'>('welcome');
  const [currentSize, setCurrentSize] = useState<'small' | 'medium' | 'large'>('medium');

  return (
    <div className={`${classes.container} min-h-screen p-6`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className={`${classes.card} flex items-center justify-between`}>
          <div>
            <h1 className={`${classes.title} text-2xl mb-2`}>
              Mascot Test Page
            </h1>
            <p className={`${classes.subtitle}`}>
              Test de nieuwe gecombineerde mascot iconen
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`${classes.button.primary} flex items-center gap-2`}
          >
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className={`${classes.card}`}>
          <h2 className={`${classes.title} text-xl mb-4`}>Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variant Selection */}
            <div>
              <h3 className={`${classes.subtitle} mb-3`}>Variant</h3>
              <div className="flex flex-wrap gap-2">
                {(['welcome', 'loading', 'achievement', 'error'] as const).map((variant) => (
                  <button
                    key={variant}
                    onClick={() => setCurrentVariant(variant)}
                    className={`px-3 py-1 rounded-button text-sm transition-all ${
                      currentVariant === variant
                        ? 'bg-japanese-red text-white'
                        : 'bg-light-secondary dark:bg-dark-secondary text-text-primary dark:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary'
                    }`}
                  >
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className={`${classes.subtitle} mb-3`}>Size</h3>
              <div className="flex flex-wrap gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setCurrentSize(size)}
                    className={`px-3 py-1 rounded-button text-sm transition-all ${
                      currentSize === size
                        ? 'bg-japanese-red text-white'
                        : 'bg-light-secondary dark:bg-dark-secondary text-text-primary dark:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mascot Display */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className={`${classes.card} text-center`}>
          <h2 className={`${classes.title} text-xl mb-6`}>
            Mascot Display - {currentVariant.charAt(0).toUpperCase() + currentVariant.slice(1)} ({currentSize})
          </h2>
          
          <div className="flex justify-center">
            <Mascots 
              variant={currentVariant}
              size={currentSize}
              className="min-h-[300px]"
            />
          </div>
          
          <div className="mt-4 text-sm text-text-secondary dark:text-text-dark-secondary">
            <p>Theme: {theme}</p>
            <p>Image: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'} version</p>
          </div>
        </div>
      </div>

      {/* Loading Mascots Examples */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className={`${classes.card}`}>
          <h2 className={`${classes.title} text-xl mb-6`}>Loading Mascots Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className={`${classes.subtitle} mb-3`}>Loading State</h3>
              <LoadingMascots 
                type="loading"
                message="Laden van lessen..."
                size="medium"
              />
            </div>
            
            <div className="text-center">
              <h3 className={`${classes.subtitle} mb-3`}>Achievement State</h3>
              <LoadingMascots 
                type="achievement"
                message="Level voltooid!"
                size="medium"
              />
            </div>
            
            <div className="text-center">
              <h3 className={`${classes.subtitle} mb-3`}>Processing State</h3>
              <LoadingMascots 
                type="processing"
                message="Verwerken..."
                size="medium"
              />
            </div>
            
            <div className="text-center">
              <h3 className={`${classes.subtitle} mb-3`}>Thinking State</h3>
              <LoadingMascots 
                type="thinking"
                message="Denken..."
                size="medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Size Comparison */}
      <div className="max-w-4xl mx-auto">
        <div className={`${classes.card}`}>
          <h2 className={`${classes.title} text-xl mb-6`}>Size Comparison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className={`${classes.subtitle} mb-3`}>Small</h3>
              <Mascots variant="welcome" size="small" />
            </div>
            
            <div className="text-center">
              <h3 className={`${classes.subtitle} mb-3`}>Medium</h3>
              <Mascots variant="welcome" size="medium" />
            </div>
            
            <div className="text-center">
              <h3 className={`${classes.subtitle} mb-3`}>Large</h3>
              <Mascots variant="welcome" size="large" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MascotTest; 