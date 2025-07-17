import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'correct' | 'incorrect' | 'neutral';
}

interface ParticleEffectsProps {
  isActive: boolean;
  type: 'correct' | 'incorrect' | 'neutral';
  count?: number;
  className?: string;
}

const ParticleEffects: React.FC<ParticleEffectsProps> = ({
  isActive,
  type,
  count = 8,
  className = ''
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Create new particles
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      life: 1,
      maxLife: 1,
      type
    }));

    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 0.02
          }))
          .filter(particle => particle.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, type, count]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className={`particle-container ${className}`}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`particle ${particle.type}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.life,
            transform: `scale(${particle.life})`
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffects; 