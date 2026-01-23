import React, { useCallback, useRef } from 'react';
import { Card } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { ColumnFirework } from './ColumnFirework';
import { cn } from '@/lib/utils';

interface TableauColumnProps {
  cards: Card[];
  columnIndex: number;
  isValidTarget: boolean;
  isDragging: boolean;
  dragFromColumn: number | null;
  dragFromIndex: number | null;
  showFirework?: boolean;
  isJokerHighlighted?: boolean;
  onDragStart: (columnIndex: number, cardIndex: number, clientX: number, clientY: number) => void;
  onFireworkComplete?: () => void;
}

export const TableauColumn: React.FC<TableauColumnProps> = ({
  cards,
  columnIndex,
  isValidTarget,
  isDragging,
  dragFromColumn,
  dragFromIndex,
  showFirework = false,
  isJokerHighlighted = false,
  onDragStart,
  onFireworkComplete,
}) => {
  // Check if card follows the previous card in sequence (same suit, rank - 1)
  const isInSequence = (cardIndex: number): boolean => {
    if (cardIndex === 0) return true;
    const prevCard = cards[cardIndex - 1];
    const currentCard = cards[cardIndex];
    
    if (!prevCard.isFaceUp || !currentCard.isFaceUp) return false;
    
    return prevCard.suit === currentCard.suit && prevCard.rank === currentCard.rank + 1;
  };

  // Check if next card breaks the sequence
  const nextBreaksSequence = (cardIndex: number): boolean => {
    if (cardIndex >= cards.length - 1) return false;
    return !isInSequence(cardIndex + 1);
  };

  // Adaptive overlap - cards in sequence are grouped, non-sequence cards get extra offset
  const getCardOverlap = (card: Card, index: number) => {
    const isFaceUp = card.isFaceUp;

    // Face-down cards get minimal overlap
    if (!isFaceUp) {
      return 14;
    }

    // Base overlap for face-up cards - optimized for better visibility
    const faceUpCount = cards.filter(c => c.isFaceUp).length;
    let baseOverlap = 30;
    if (faceUpCount <= 5) baseOverlap = 40;
    else if (faceUpCount <= 8) baseOverlap = 35;
    else if (faceUpCount <= 12) baseOverlap = 32;

    // Add extra offset if this card is NOT in sequence with previous
    // OR if the next card breaks the sequence (to show last card of series)
    const needsExtraSpace = !isInSequence(index) || nextBreaksSequence(index);

    return needsExtraSpace ? baseOverlap + 16 : baseOverlap;
  };

  // Calculate cumulative top position for each card
  const getCardTop = (cardIndex: number): number => {
    let top = 0;
    for (let i = 0; i < cardIndex; i++) {
      top += getCardOverlap(cards[i], i);
    }
    return top;
  };

  const isBeingDragged = (cardIndex: number) => {
    if (dragFromColumn !== columnIndex) return false;
    return dragFromIndex !== null && cardIndex >= dragFromIndex;
  };

  const handleFireworkComplete = useCallback(() => {
    onFireworkComplete?.();
  }, [onFireworkComplete]);

  // Pointer down handler
  const handlePointerDown = useCallback((e: React.PointerEvent, cardIndex: number) => {
    const card = cards[cardIndex];
    if (!card.isFaceUp) return;

    e.preventDefault();
    e.stopPropagation();
    
    onDragStart(columnIndex, cardIndex, e.clientX, e.clientY);
  }, [cards, columnIndex, onDragStart]);

  // Calculate total height needed
  const totalHeight = cards.length > 0 
    ? getCardTop(cards.length - 1) + 70 
    : 0;

  return (
    <div className="relative flex-1 min-w-0 flex flex-col">
      <div
        data-column={columnIndex}
        className={cn(
          "relative flex-1 min-w-0",
          "rounded-lg transition-all duration-200",
          isValidTarget && isDragging && "bg-gold/20 ring-2 ring-gold/50",
          isJokerHighlighted && " animate-joker-flicker",
        )}
      >
        <ColumnFirework isActive={showFirework} onComplete={handleFireworkComplete} />

        {cards.length === 0 ? (
          <div
            data-column={columnIndex}
            className={cn(
              "aspect-[2.5/3.5] rounded-lg",
              "border-2 border-dashed border-muted-foreground/30",
              "bg-muted/10 transition-all",
              isValidTarget && isDragging && "border-gold bg-gold/10 scale-105",
            )}
          />
      ) : (
        <div 
          data-column={columnIndex}
          className="relative touch-none" 
          style={{ paddingBottom: `${totalHeight}px` }}
        >
          {cards.map((card, index) => {
            const isTop = index === cards.length - 1;
            const dragging = isBeingDragged(index);
            const top = getCardTop(index);

            return (
              <div
                key={card.id}
                data-column={columnIndex}
                className={cn(
                  "absolute left-0 right-0",
                  dragging && "opacity-0",
                )}
                style={{
                  top: `${top}px`,
                  zIndex: index,
                  transition: 'none',
                }}
                onPointerDown={(e) => handlePointerDown(e, index)}
              >
                <PlayingCard
                  card={card}
                  isTop={isTop}
                  isDragging={dragging}
                  isValidTarget={isTop && isValidTarget && !isDragging}
                />
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};
