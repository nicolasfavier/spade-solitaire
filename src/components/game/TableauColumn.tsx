import React from 'react';
import { Card, DragInfo } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { cn } from '@/lib/utils';

interface TableauColumnProps {
  cards: Card[];
  columnIndex: number;
  isValidTarget: boolean;
  onDragStart: (dragInfo: DragInfo) => void;
  onDrop: () => void;
  canDragFrom: (cardIndex: number) => boolean;
  dragInfo: DragInfo | null;
}

export const TableauColumn: React.FC<TableauColumnProps> = ({
  cards,
  columnIndex,
  isValidTarget,
  onDragStart,
  onDrop,
  canDragFrom,
  dragInfo,
}) => {
  const cardOverlap = cards.length > 8 ? 18 : cards.length > 6 ? 22 : 28;
  
  const handleDragStart = (cardIndex: number) => {
    if (!canDragFrom(cardIndex)) return;
    
    const cardsToMove = cards.slice(cardIndex);
    onDragStart({
      cards: cardsToMove,
      fromColumn: columnIndex,
      fromIndex: cardIndex,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isValidTarget) {
      e.preventDefault();
      onDrop();
    }
  };

  return (
    <div
      className={cn(
        "relative flex-1 min-w-0",
        "rounded-lg transition-all duration-200",
        isValidTarget && "bg-gold/10 ring-2 ring-gold/50",
      )}
      onTouchEnd={handleTouchEnd}
      onClick={() => isValidTarget && onDrop()}
    >
      {cards.length === 0 ? (
        <div 
          className={cn(
            "aspect-[2.5/3.5] rounded-lg",
            "border-2 border-dashed border-muted-foreground/30",
            "bg-muted/10",
            isValidTarget && "border-gold/50 bg-gold/5",
          )}
        />
      ) : (
        <div className="relative">
          {cards.map((card, index) => {
            const isTop = index === cards.length - 1;
            const isDragging = dragInfo?.fromColumn === columnIndex && index >= dragInfo.fromIndex;
            const canDrag = card.isFaceUp && canDragFrom(index);

            return (
              <div
                key={card.id}
                className={cn(
                  "relative",
                  index > 0 && "absolute left-0 right-0",
                  isDragging && "opacity-50",
                )}
                style={{
                  top: index > 0 ? `${index * cardOverlap}px` : undefined,
                  zIndex: index,
                }}
              >
                <PlayingCard
                  card={card}
                  isTop={isTop && canDrag}
                  isValidTarget={isTop && isValidTarget}
                  onDragStart={canDrag ? () => handleDragStart(index) : undefined}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
