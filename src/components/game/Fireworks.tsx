import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  opacity: number;
  decay: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  particles: Particle[];
}

const COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#A78BFA', // Purple
  '#F472B6', // Pink
  '#FBBF24', // Amber
  '#34D399', // Emerald
];

export const Fireworks: React.FC = () => {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  useEffect(() => {
    const createFirework = () => {
      const id = Date.now() + Math.random();
      const x = 20 + Math.random() * 60; // 20-80% of screen width
      const y = 20 + Math.random() * 40; // 20-60% of screen height
      
      const particles: Particle[] = [];
      const particleCount = 30 + Math.floor(Math.random() * 20);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: i,
          x: 0,
          y: 0,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 2 + Math.random() * 4,
          angle: (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5,
          speed: 2 + Math.random() * 4,
          opacity: 1,
          decay: 0.015 + Math.random() * 0.01,
        });
      }

      return { id, x, y, particles };
    };

    // Initial fireworks
    const initialFireworks = [createFirework(), createFirework(), createFirework()];
    setFireworks(initialFireworks);

    // Add new fireworks periodically
    const interval = setInterval(() => {
      setFireworks(prev => {
        const filtered = prev.filter(fw => 
          fw.particles.some(p => p.opacity > 0)
        );
        return [...filtered, createFirework()];
      });
    }, 800);

    // Animation frame
    const animate = () => {
      setFireworks(prev => 
        prev.map(fw => ({
          ...fw,
          particles: fw.particles.map(p => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed + 0.5, // gravity
            speed: p.speed * 0.97,
            opacity: Math.max(0, p.opacity - p.decay),
          })),
        }))
      );
    };

    const animationInterval = setInterval(animate, 30);

    return () => {
      clearInterval(interval);
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {fireworks.map(fw => (
        <div
          key={fw.id}
          className="absolute"
          style={{
            left: `${fw.x}%`,
            top: `${fw.y}%`,
          }}
        >
          {fw.particles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.opacity,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
