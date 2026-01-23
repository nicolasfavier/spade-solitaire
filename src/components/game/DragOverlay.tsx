import React from 'react';
import { Card } from '@/types/game';
import { PlayingCard } from './PlayingCard';

interface DragOverlayProps {
  cards: Card[];
  position: { x: number; y: number };
}

export const DragOverlay: React.FC<DragOverlayProps> = ({ cards, position }) => {
  if (cards.length === 0) return null;

  return (
    <div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -20px)',
        width: '10vw',
        minWidth: '60px',
        maxWidth: '100px',
      }}
    >
      {cards.map((card, index) => (
        <div
          key={card.id}
          className="absolute left-0 right-0 transition-none"
          style={{
            top: `${index * 36}px`,
            zIndex: index,
          }}
        >
          <PlayingCard card={card} isTop={index === cards.length - 1} />
        </div>
      ))}
    </div>
  );
};
