import React from 'react';
import { useTheme } from '../context/ThemeContext';
import sunCircleSvg from '../assets/sun-circle.svg';

interface HeroProps {
  children: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({ children }) => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className="hero">
      <div className="relative">
        <img
          src={sunCircleSvg}
          alt=""
          className="absolute top-1/2 right-0 w-[400px] h-[400px] opacity-10 transform -translate-y-1/2 z-0"
          style={{ maxWidth: 'none' }}
        />
        <div className="hero-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Hero; 