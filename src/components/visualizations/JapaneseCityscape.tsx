import React from 'react';
import { Box } from '@mui/material';

interface JapaneseCityscapeProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const JapaneseCityscape: React.FC<JapaneseCityscapeProps> = ({
  width = 800,
  height = 400,
  className,
  style
}) => {
  // Calculate proportional dimensions
  const toriiHeight = height * 0.4;
  const toriiWidth = toriiHeight * 0.6;
  const mountainHeight = height * 0.3;
  const buildingHeight = height * 0.5;
  const buildingWidth = width * 0.1;

  return (
    <Box
      className={className}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1a237e', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#0d47a1', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#455a64', stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: '#263238', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#37474f', stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: '#263238', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width={width} height={height} fill="url(#skyGradient)" />

        {/* Mountains */}
        <path
          d={`
            M 0 ${height}
            L ${width * 0.2} ${height - mountainHeight * 0.7}
            L ${width * 0.4} ${height - mountainHeight}
            L ${width * 0.6} ${height - mountainHeight * 0.8}
            L ${width * 0.8} ${height - mountainHeight * 0.9}
            L ${width} ${height - mountainHeight * 0.6}
            L ${width} ${height}
            Z
          `}
          fill="url(#mountainGradient)"
        />

        {/* Buildings */}
        {Array.from({ length: 8 }).map((_, i) => {
          const x = width * (0.1 + i * 0.1);
          const buildingH = buildingHeight * (0.7 + Math.random() * 0.3);
          return (
            <g key={i}>
              <rect
                x={x}
                y={height - buildingH}
                width={buildingWidth}
                height={buildingH}
                fill="url(#buildingGradient)"
              />
              {/* Windows */}
              {Array.from({ length: Math.floor(buildingH / 30) }).map((_, j) => (
                <rect
                  key={j}
                  x={x + buildingWidth * 0.2}
                  y={height - buildingH + j * 30 + 10}
                  width={buildingWidth * 0.6}
                  height={15}
                  fill={Math.random() > 0.3 ? '#ffd700' : '#37474f'}
                  opacity={0.8}
                />
              ))}
            </g>
          );
        })}

        {/* Torii Gate */}
        <g transform={`translate(${width * 0.5 - toriiWidth / 2}, ${height - toriiHeight})`}>
          {/* Main pillars */}
          <rect x={toriiWidth * 0.1} y={toriiHeight * 0.3} width={toriiWidth * 0.1} height={toriiHeight * 0.7} fill="#8b4513" />
          <rect x={toriiWidth * 0.8} y={toriiHeight * 0.3} width={toriiWidth * 0.1} height={toriiHeight * 0.7} fill="#8b4513" />
          
          {/* Top beam */}
          <rect x={0} y={toriiHeight * 0.2} width={toriiWidth} height={toriiHeight * 0.1} fill="#8b4513" />
          
          {/* Second beam */}
          <rect x={toriiWidth * 0.1} y={toriiHeight * 0.3} width={toriiWidth * 0.8} height={toriiHeight * 0.05} fill="#8b4513" />
          
          {/* Decorative elements */}
          <path
            d={`
              M ${toriiWidth * 0.1} ${toriiHeight * 0.2}
              L ${toriiWidth * 0.2} ${toriiHeight * 0.1}
              L ${toriiWidth * 0.8} ${toriiHeight * 0.1}
              L ${toriiWidth * 0.9} ${toriiHeight * 0.2}
            `}
            fill="#a52a2a"
          />
        </g>

        {/* Cherry Blossoms */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = Math.random() * width;
          const y = Math.random() * (height * 0.7);
          const size = 5 + Math.random() * 10;
          return (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {Array.from({ length: 5 }).map((_, j) => (
                <path
                  key={j}
                  d={`
                    M 0 0
                    L ${size * Math.cos(j * Math.PI * 2 / 5)} ${size * Math.sin(j * Math.PI * 2 / 5)}
                    L ${size * 0.5 * Math.cos((j + 0.5) * Math.PI * 2 / 5)} ${size * 0.5 * Math.sin((j + 0.5) * Math.PI * 2 / 5)}
                    Z
                  `}
                  fill="#ffb7c5"
                  opacity={0.6}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

export default JapaneseCityscape; 