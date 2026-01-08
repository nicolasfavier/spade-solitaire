import React, { useState, useEffect } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
}

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

interface ColumnFireworkProps {
  isActive: boolean;
  onComplete: () => void;
}

export const ColumnFirework: React.FC<ColumnFireworkProps> = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) return;

    // Create initial burst of particles - more particles, bigger
    const newParticles: Particle[] = [];
    const particleCount = 50; // More particles
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
      const speed = 3 + Math.random() * 6; // Faster
      newParticles.push({
        id: i,
        x: 50,
        y: 40, // Start slightly higher
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Initial upward boost
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.random() * 6, // Bigger
        opacity: 1,
      });
    }
    setParticles(newParticles);

    // Animation loop - longer duration
    let animationFrame: number;
    let frame = 0;
    const maxFrames = 120; // Double the duration

    const animate = () => {
      frame++;
      if (frame >= maxFrames) {
        setParticles([]);
        onComplete();
        return;
      }

      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.12, // Slower gravity
          opacity: p.opacity - 0.012, // Slower fade
          size: p.size * 0.99,
        })).filter(p => p.opacity > 0)
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50" style={{ overflow: 'visible' }}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 5}px ${particle.color}80`,
          }}
        />
      ))}
    </div>
  );
};
