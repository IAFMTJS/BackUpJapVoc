import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import HybridMascots from './HybridMascots';

interface MascotFooterProps {
  message?: string;
  mascotVariant?: string;
  mascotContext?: string;
  mascotMood?: string;
  showMascots?: boolean;
  className?: string;
}

const MascotFooter: React.FC<MascotFooterProps> = ({
  message = "Keep learning and have fun! 🎉",
  mascotVariant = "cheering",
  mascotContext = "achievement",
  mascotMood = "positive",
  showMascots = true,
  className = ""
}) => {
  const { theme } = useTheme();

  return (
    <div className={`text-center mt-8 ${className}`}>
      {showMascots && (
        <div className="flex justify-center items-center space-x-8 mb-4">
          <HybridMascots
            type="emotions"
            size="medium"
            variant="excited"
            context="game"
          />
          <HybridMascots
            type="emotions"
            size="medium"
            variant={mascotVariant}
            context={mascotContext}
          />
          <HybridMascots
            type="emotions"
            size="medium"
            variant="supportive"
            context="study"
          />
        </div>
      )}
      <p className={`${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
        {message}
      </p>
    </div>
  );
};

export default MascotFooter; 