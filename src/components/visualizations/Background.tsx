import React from 'react';

interface BackgroundProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Background: React.FC<BackgroundProps> = ({
  width = 1152,
  height = 768,
  className,
  style
}) => {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 50%, #1e1e1e 100%)',
        ...style
      }}
    >
      {/* Subtle pattern overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default Background; 