import React, { useEffect, useRef, useMemo } from 'react';

// Particle system for cherry blossoms
const useParticles = (count: number, width: number, height: number) => {
  return useMemo(() => Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 2 + Math.random() * 3,
    speed: 0.5 + Math.random() * 1.5,
    angle: Math.random() * Math.PI * 2,
    rotation: Math.random() * 360,
    rotationSpeed: -2 + Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.7,
    sway: Math.random() * 0.02,
    swayOffset: Math.random() * Math.PI * 2
  })), [count, width, height]);
};

// Lantern system
const useLanterns = (count: number, width: number, height: number) => {
  return useMemo(() => Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * (height * 0.6),
    size: 20 + Math.random() * 15,
    speed: 0.2 + Math.random() * 0.3,
    sway: 0.5 + Math.random() * 1,
    swayOffset: Math.random() * Math.PI * 2,
    color: Math.random() > 0.5 ? '#ff00c8' : '#00f7ff',
    opacity: 0.6 + Math.random() * 0.4
  })), [count, width, height]);
};

const NeonBackground: React.FC<{ width?: number; height?: number; className?: string; style?: React.CSSProperties }> = ({
  width = 1152,
  height = 768,
  className,
  style
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const particles = useParticles(50, width, height);
  const lanterns = useLanterns(8, width, height);
  const [hoveredKanji, setHoveredKanji] = React.useState<number | null>(null);

  // Animation frame reference
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        mousePos.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop for particles and lanterns
  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.016; // Approximately 60fps
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Generate random building heights and positions
  const buildings = useMemo(() => Array.from({ length: 15 }, (_, i) => {
    const x = 60 + i * 80 + (i % 2 === 0 ? 10 : -10);
    const w = 40 + (i % 3) * 10;
    const h = 120 + (i % 4) * 40;
    const windows = Math.floor(h / 24);
    const windowRows = Array.from({ length: windows }, (_, j) => ({
      y: height - h - 60 + 8 + j * 24,
      lit: Math.random() > 0.3,
      flickerSpeed: 2 + Math.random() * 3
    }));
    return { x, w, h, windowRows, parallax: 0.2 + (i % 3) * 0.1 };
  }), [height]);

  // Generate floating kanji with hover effects
  const kanji = useMemo(() => ['日', '本', '語', '学', '習', '漢', '字', '読', '書', '話'].map((char, i) => ({
    char,
    x: 50 + (i * 100) % width,
    y: 50 + Math.sin(i * 0.5) * 30,
    size: 24 + (i % 3) * 8,
    delay: i * 0.5,
    parallax: 0.1 + (i % 2) * 0.05
  })), [width]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Enhanced Neon Glow Filters */}
        <filter id="neon-glow-pink" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 1   0 0 0 0 0   0 0 0 0 0.78  0 0 0 1 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="neon-glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="0 0 0 0 0   0 1 0 0 0.97   0 0 1 0 1   0 0 0 1 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="neon-glow-purple" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="0.61 0 0 0 0.61   0 0 0 0 0   0 0 1 0 1   0 0 0 1 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient definitions */}
        <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#00f7ff', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#ff00c8', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#9c00ff', stopOpacity: 1 }} />
        </linearGradient>

        {/* Pattern for scanlines */}
        <pattern id="scanlines" width="100%" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(0,247,255,0.1)" strokeWidth="1" />
        </pattern>

        {/* New filters for enhanced effects */}
        <filter id="neon-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 1   0 1 0 0 1   0 0 1 0 1   0 0 0 1 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Cherry blossom petal pattern */}
        <pattern id="cherry-blossom" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M10,0 C12,5 15,10 20,10 C15,10 12,15 10,20 C8,15 5,10 0,10 C5,10 8,5 10,0"
            fill="rgba(255,192,203,0.3)"
          />
        </pattern>

        {/* Lantern gradient */}
        <radialGradient id="lantern-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Night sky background with parallax effect */}
      <rect width="100%" height="100%" fill="#0d0d1a">
        <animate
          attributeName="fill"
          values="#0d0d1a;#0d0d2a;#0d0d1a"
          dur="10s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Cherry blossom particles */}
      {particles.map((particle, i) => (
        <g
          key={`particle-${i}`}
          transform={`translate(${particle.x + Math.sin(timeRef.current * particle.sway + particle.swayOffset) * 20}, 
                              ${particle.y + timeRef.current * particle.speed}) 
                     rotate(${particle.rotation + timeRef.current * particle.rotationSpeed})`}
        >
          <path
            d="M0,0 C2,5 5,10 10,10 C5,10 2,15 0,20 C-2,15 -5,10 -10,10 C-5,10 -2,5 0,0"
            fill="#ffb7c5"
            opacity={particle.opacity}
            filter="url(#neon-glow-pink)"
          >
            <animate
              attributeName="opacity"
              values={`${particle.opacity};${particle.opacity * 0.5};${particle.opacity}`}
              dur={`${2 + i % 3}s`}
              repeatCount="indefinite"
            />
          </path>
        </g>
      ))}

      {/* Floating lanterns */}
      {lanterns.map((lantern, i) => (
        <g
          key={`lantern-${i}`}
          transform={`translate(${lantern.x + Math.sin(timeRef.current * lantern.sway + lantern.swayOffset) * 30}, 
                              ${lantern.y + timeRef.current * lantern.speed})`}
        >
          <circle
            cx="0"
            cy="0"
            r={lantern.size}
            fill={lantern.color}
            opacity={lantern.opacity}
            filter="url(#neon-glow-strong)"
          >
            <animate
              attributeName="opacity"
              values={`${lantern.opacity};${lantern.opacity * 0.7};${lantern.opacity}`}
              dur={`${3 + i % 2}s`}
              repeatCount="indefinite"
            />
          </circle>
          <path
            d="M-5,-15 L5,-15 L8,-5 L-8,-5 Z"
            fill={lantern.color}
            opacity={lantern.opacity * 0.8}
            filter="url(#neon-glow-strong)"
          />
        </g>
      ))}

      {/* Neon cityscape buildings */}
      {buildings.map((building, i) => (
        <g
          key={i}
          transform={`translate(${building.x + mousePos.current.x * building.parallax * 50}, 0)`}
        >
          <rect
            x={building.x}
            y={height - building.h - 60}
            width={building.w}
            height={building.h}
            fill="#181a2a"
            stroke="#00f7ff"
            strokeWidth="2"
            filter="url(#neon-glow-cyan)"
            opacity="0.7"
          >
            <animate
              attributeName="opacity"
              values="0.7;0.8;0.7"
              dur={`${2 + i % 3}s`}
              repeatCount="indefinite"
            />
          </rect>
          {/* Animated neon windows */}
          {building.windowRows.map((row, j) => (
            <rect
              key={j}
              x={building.x + 8}
              y={row.y}
              width={building.w - 16}
              height={10}
              fill="#00f7ff"
              opacity={row.lit ? 0.7 : 0.2}
              filter="url(#neon-glow-cyan)"
            >
              <animate
                attributeName="opacity"
                values={row.lit ? "0.7;0.3;0.7" : "0.2;0.1;0.2"}
                dur={`${3 + (i + j) % 4}s`}
                repeatCount="indefinite"
              />
            </rect>
          ))}
        </g>
      ))}

      {/* Enhanced neon sun with pulsing effect */}
      <circle
        cx={width * 0.75}
        cy={height * 0.18}
        r="110"
        fill="url(#neon-gradient)"
        filter="url(#neon-glow-pink)"
        opacity="0.85"
      >
        <animate
          attributeName="r"
          values="110;115;110"
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.85;0.95;0.85"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Enhanced neon torii gate with gradient */}
      <g filter="url(#neon-glow-purple)" transform={`translate(${width * 0.65},${height * 0.23}) scale(3.2)`}>
        <path
          d="M-30,0 L30,0 L24,14 L-24,14 Z"
          fill="url(#neon-gradient)"
          stroke="#ff00c8"
          strokeWidth="2"
        >
          <animate
            attributeName="stroke"
            values="#ff00c8;#00f7ff;#ff00c8"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        <rect x="-20" y="18" width="6" height="32" fill="url(#neon-gradient)" />
        <rect x="14" y="18" width="6" height="32" fill="url(#neon-gradient)" />
      </g>

      {/* Floating neon kanji with animations */}
      {kanji.map((k, i) => (
        <g
          key={i}
          transform={`translate(${k.x + mousePos.current.x * k.parallax * 30}, 
                              ${k.y + mousePos.current.y * k.parallax * 30})`}
          onMouseEnter={() => setHoveredKanji(i)}
          onMouseLeave={() => setHoveredKanji(null)}
          style={{ cursor: 'pointer' }}
        >
          <text
            x="0"
            y="0"
            fontSize={k.size}
            fill="url(#neon-gradient)"
            filter={hoveredKanji === i ? "url(#neon-glow-strong)" : "url(#neon-glow-cyan)"}
            opacity={hoveredKanji === i ? 1 : 0.8}
            style={{ fontFamily: 'Noto Sans JP, sans-serif' }}
            transform={hoveredKanji === i ? "scale(1.1)" : "scale(1)"}
          >
            <animate
              attributeName="y"
              values={`0;-20;0`}
              dur={`${3 + i}s`}
              begin={`${k.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values={hoveredKanji === i ? "1;0.9;1" : "0.8;0.4;0.8"}
              dur={`${3 + i}s`}
              begin={`${k.delay}s`}
              repeatCount="indefinite"
            />
            {k.char}
          </text>
        </g>
      ))}

      {/* Scanlines overlay */}
      <rect
        width="100%"
        height="100%"
        fill="url(#scanlines)"
        opacity="0.1"
      >
        <animate
          attributeName="opacity"
          values="0.1;0.2;0.1"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Vignette effect */}
      <radialGradient id="vignette" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: 'rgba(13,13,26,0)', stopOpacity: 0 }} />
        <stop offset="100%" style={{ stopColor: 'rgba(13,13,26,0.8)', stopOpacity: 1 }} />
      </radialGradient>
      <rect width="100%" height="100%" fill="url(#vignette)" />
    </svg>
  );
};

export default NeonBackground; 