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
      const x = 10 + Math.random() * 80; // 10-90% of screen width
      const y = 10 + Math.random() * 50; // 10-60% of screen height
      
      const particles: Particle[] = [];
      const particleCount = 50 + Math.floor(Math.random() * 30); // More particles
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: i,
          x: 0,
          y: 0,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 4 + Math.random() * 6, // Bigger particles
          angle: (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5,
          speed: 3 + Math.random() * 6, // Faster
          opacity: 1,
          decay: 0.008 + Math.random() * 0.006, // Slower decay
        });
      }

      return { id, x, y, particles };
    };

    // More initial fireworks
    const initialFireworks = [createFirework(), createFirework(), createFirework(), createFirework()];
    setFireworks(initialFireworks);

    // Add new fireworks periodically
    const interval = setInterval(() => {
      setFireworks(prev => {
        const filtered = prev.filter(fw => 
          fw.particles.some(p => p.opacity > 0)
        );
        return [...filtered, createFirework()];
      });
    }, 500); // Faster spawning

    // Animation frame
    const animate = () => {
      setFireworks(prev => 
        prev.map(fw => ({
          ...fw,
          particles: fw.particles.map(p => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed + 0.4, // gravity
            speed: p.speed * 0.98,
            opacity: Math.max(0, p.opacity - p.decay),
          })),
        }))
      );
    };

    const animationInterval = setInterval(animate, 25);

    return () => {
      clearInterval(interval);
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
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
                boxShadow: `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 6}px ${p.color}50`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
