import React, { useEffect, useState } from 'react';

interface SakuraPetal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

interface CulturalBackgroundProps {
  type: 'sakura' | 'torii' | 'bamboo';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const CulturalBackground: React.FC<CulturalBackgroundProps> = ({
  type,
  intensity = 'medium',
  className = ''
}) => {
  const [sakuraPetals, setSakuraPetals] = useState<SakuraPetal[]>([]);

  useEffect(() => {
    if (type !== 'sakura') return;

    const petalCount = intensity === 'low' ? 3 : intensity === 'medium' ? 6 : 10;
    
    const petals: SakuraPetal[] = Array.from({ length: petalCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 4,
      size: 0.8 + Math.random() * 0.4
    }));

    setSakuraPetals(petals);
  }, [type, intensity]);

  if (type === 'sakura') {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
        {sakuraPetals.map(petal => (
          <div
            key={petal.id}
            className="sakura-petal"
            style={{
              left: `${petal.x}%`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              transform: `scale(${petal.size})`
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'torii') {
    return (
      <div className={`absolute inset-0 pointer-events-none ${className}`}>
        <div className="bg-pattern-torii w-full h-full opacity-10" />
      </div>
    );
  }

  if (type === 'bamboo') {
    return (
      <div className={`absolute inset-0 pointer-events-none ${className}`}>
        <div className="w-full h-full opacity-5">
          {/* Bamboo pattern */}
          <div className="absolute left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-green-800 to-green-600" />
          <div className="absolute left-10 top-1/4 w-1 h-1 bg-green-700 rounded-full" />
          <div className="absolute left-10 top-1/2 w-1 h-1 bg-green-700 rounded-full" />
          <div className="absolute left-10 top-3/4 w-1 h-1 bg-green-700 rounded-full" />
          
          <div className="absolute right-10 top-0 bottom-0 w-1 bg-gradient-to-b from-green-800 to-green-600" />
          <div className="absolute right-10 top-1/3 w-1 h-1 bg-green-700 rounded-full" />
          <div className="absolute right-10 top-2/3 w-1 h-1 bg-green-700 rounded-full" />
        </div>
      </div>
    );
  }

  return null;
};

export default CulturalBackground; 