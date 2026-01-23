import React, { useEffect, useRef, useState } from 'react';

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

const MAX_FIREWORKS = 4;
const FIREWORK_INTERVAL = 800;
const PARTICLE_COUNT_MIN = 20;
const PARTICLE_COUNT_MAX = 30;

export const Fireworks: React.FC = () => {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const lastFireworkRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const createFirework = (): Firework => {
      const id = Date.now() + Math.random();
      const x = 20 + Math.random() * 60;
      const y = 20 + Math.random() * 40;

      const particles: Particle[] = [];
      const particleCount = PARTICLE_COUNT_MIN + Math.floor(Math.random() * (PARTICLE_COUNT_MAX - PARTICLE_COUNT_MIN));

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: i,
          x: 0,
          y: 0,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 7 + Math.random() * 3,
          angle: (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5,
          speed: 3 + Math.random() * 3,
          opacity: 1,
          decay: 0.020 + Math.random() * 0.01,
        });
      }

      return { id, x, y, particles };
    };

    const animate = (timestamp: number) => {
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = timestamp - lastUpdateRef.current;

      if (deltaTime >= 30) {
        lastUpdateRef.current = timestamp;

        setFireworks(prev => {
          let updated = prev.map(fw => ({
            ...fw,
            particles: fw.particles.map(p => ({
              ...p,
              x: p.x + Math.cos(p.angle) * p.speed,
              y: p.y + Math.sin(p.angle) * p.speed + 0.5,
              speed: p.speed * 0.97,
              opacity: Math.max(0, p.opacity - p.decay),
            })),
          }));

          updated = updated.filter(fw =>
            fw.particles.some(p => p.opacity > 0)
          );

          if (timestamp - lastFireworkRef.current >= FIREWORK_INTERVAL && updated.length < MAX_FIREWORKS) {
            lastFireworkRef.current = timestamp;
            updated.push(createFirework());
          }

          return updated;
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;

      if (document.hidden) {
        setFireworks([]);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        lastUpdateRef.current = performance.now();
        lastFireworkRef.current = performance.now();
        setFireworks([createFirework(), createFirework()]);
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    const initialFireworks = [createFirework(), createFirework()];
    setFireworks(initialFireworks);
    lastUpdateRef.current = performance.now();
    lastFireworkRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
