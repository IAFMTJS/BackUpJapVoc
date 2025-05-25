import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ToriiGateProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
}

const ToriiGate: React.FC<ToriiGateProps> = ({ 
  className = '', 
  size = 'medium',
  opacity = 0.15 
}) => {
  const { getThemeClasses, isDarkMode } = useTheme();
  const themeClasses = getThemeClasses();

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  // Use white color for the torii gate when opacity is 1 (hero section)
  const gateColor = opacity === 1 ? '#FFFFFF' : (isDarkMode ? '#4B9CD3' : '#2563EB');
  const shadowColor = opacity === 1 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ opacity }}
        aria-hidden="true"
      >
        {/* Shadow effect */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor={shadowColor} floodOpacity="0.3"/>
        </filter>

        {/* Main structure with shadow */}
        <g filter="url(#shadow)">
          {/* Main pillars */}
          <rect x="20" y="40" width="8" height="60" fill={gateColor} />
          <rect x="72" y="40" width="8" height="60" fill={gateColor} />
          
          {/* Top beam with decorative ends */}
          <rect x="15" y="35" width="70" height="8" fill={gateColor} />
          <path d="M15 35 L15 43 L12 43 L12 35 Z" fill={gateColor} />
          <path d="M85 35 L85 43 L88 43 L88 35 Z" fill={gateColor} />
          
          {/* Second beam with decorative ends */}
          <rect x="10" y="25" width="80" height="6" fill={gateColor} />
          <path d="M10 25 L10 31 L7 31 L7 25 Z" fill={gateColor} />
          <path d="M90 25 L90 31 L93 31 L93 25 Z" fill={gateColor} />
          
          {/* Decorative elements */}
          <rect x="28" y="20" width="44" height="5" fill={gateColor} />
          <rect x="35" y="15" width="30" height="5" fill={gateColor} />
          
          {/* Roof details with curved top */}
          <path
            d="M10 25 Q50 10 90 25"
            stroke={gateColor}
            strokeWidth="2"
            fill="none"
          />
          
          {/* Decorative circles (tomoe style) */}
          <circle cx="30" cy="45" r="2.5" fill={gateColor} />
          <circle cx="70" cy="45" r="2.5" fill={gateColor} />
          <path
            d="M30 45 Q32 43 30 42 Q28 43 30 45"
            stroke={gateColor}
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M70 45 Q72 43 70 42 Q68 43 70 45"
            stroke={gateColor}
            strokeWidth="0.5"
            fill="none"
          />

          {/* Additional decorative elements for larger size */}
          {size === 'large' && (
            <>
              {/* Decorative lines */}
              <path
                d="M15 35 L85 35"
                stroke={gateColor}
                strokeWidth="0.5"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M10 25 L90 25"
                stroke={gateColor}
                strokeWidth="0.5"
                fill="none"
                opacity="0.5"
              />
              {/* Decorative patterns */}
              <path
                d="M25 40 L25 45 M75 40 L75 45"
                stroke={gateColor}
                strokeWidth="0.5"
                fill="none"
                opacity="0.3"
              />
              {/* Small decorative circles */}
              <circle cx="40" cy="20" r="1" fill={gateColor} opacity="0.5" />
              <circle cx="60" cy="20" r="1" fill={gateColor} opacity="0.5" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

export default ToriiGate; 