import React from 'react';

const NeonBackground: React.FC<{ width?: number; height?: number; className?: string; style?: React.CSSProperties }> = ({
  width = 1152,
  height = 768,
  className,
  style
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Neon Glow Filter */}
        <filter id="neon-glow-pink" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neon-glow-blue" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Night sky background */}
      <rect width="100%" height="100%" fill="#0d0d1a" />
      {/* Neon cityscape buildings */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 60 + i * 80 + (i % 2 === 0 ? 10 : -10);
        const w = 40 + (i % 3) * 10;
        const h = 120 + (i % 4) * 40;
        return (
          <g key={i}>
            <rect
              x={x}
              y={height - h - 60}
              width={w}
              height={h}
              fill="#181a2a"
              stroke="#00f7ff"
              strokeWidth="2"
              filter="url(#neon-glow-blue)"
              opacity="0.7"
            />
            {/* Neon windows */}
            {Array.from({ length: Math.floor(h / 24) }).map((_, j) => (
              <rect
                key={j}
                x={x + 8}
                y={height - h - 60 + 8 + j * 24}
                width={w - 16}
                height={10}
                fill="#00f7ff"
                opacity={Math.random() > 0.3 ? 0.7 : 0.2}
                filter="url(#neon-glow-blue)"
              />
            ))}
          </g>
        );
      })}
      {/* Neon sun */}
      <circle
        cx={width * 0.75}
        cy={height * 0.18}
        r={110}
        fill="#ff00c8"
        filter="url(#neon-glow-pink)"
        opacity="0.85"
      />
      {/* Neon torii gate */}
      <g filter="url(#neon-glow-pink)" transform={`translate(${width * 0.65},${height * 0.23}) scale(3.2)`}>
        {/* Top beam */}
        <rect x="-30" y="0" width="60" height="6" fill="#ff00c8" />
        {/* Bottom beam */}
        <rect x="-24" y="14" width="48" height="4" fill="#ff00c8" />
        {/* Left pillar */}
        <rect x="-20" y="18" width="6" height="32" fill="#ff00c8" />
        {/* Right pillar */}
        <rect x="14" y="18" width="6" height="32" fill="#ff00c8" />
      </g>
      {/* Floating neon kanji */}
      <text
        x={width * 0.83}
        y={height * 0.23}
        fontSize="64"
        fontFamily="'Noto Sans JP', 'Orbitron', 'sans-serif'"
        fill="#00f7ff"
        filter="url(#neon-glow-blue)"
        style={{ fontWeight: 900 }}
      >
        語
      </text>
      <text
        x={width * 0.83}
        y={height * 0.32}
        fontSize="64"
        fontFamily="'Noto Sans JP', 'Orbitron', 'sans-serif'"
        fill="#00f7ff"
        filter="url(#neon-glow-blue)"
        style={{ fontWeight: 900 }}
      >
        漢
      </text>
    </svg>
  );
};

export default NeonBackground; 