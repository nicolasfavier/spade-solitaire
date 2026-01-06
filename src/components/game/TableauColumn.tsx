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
  onDragStart: (columnIndex: number, cardIndex: number) => void;
  onDragEnd: () => void;
  onDrop: () => void;
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
  onDragStart,
  onDragEnd,
  onDrop,
  onFireworkComplete,
}) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

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
      return 10;
    }
    
    // Base overlap for face-up cards - larger on tablet
    const faceUpCount = cards.filter(c => c.isFaceUp).length;
    let baseOverlap = 22;
    if (faceUpCount <= 5) baseOverlap = 28;
    else if (faceUpCount <= 8) baseOverlap = 25;
    
    // Add extra offset if this card is NOT in sequence with previous
    // OR if the next card breaks the sequence (to show last card of series)
    const needsExtraSpace = !isInSequence(index) || nextBreaksSequence(index);
    
    return needsExtraSpace ? baseOverlap + 12 : baseOverlap;
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

  // Touch/Mouse handlers for drag and drop
  const handlePointerDown = useCallback((e: React.PointerEvent, cardIndex: number) => {
    const card = cards[cardIndex];
    if (!card.isFaceUp) return;

    e.preventDefault();
    e.stopPropagation();
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    // Start drag immediately for better responsiveness
    onDragStart(columnIndex, cardIndex);
  }, [cards, columnIndex, onDragStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're over a valid target
    if (isValidTarget && dragFromColumn !== columnIndex) {
      onDrop();
    } else {
      onDragEnd();
    }
    
    dragStartPos.current = null;
  }, [isDragging, isValidTarget, dragFromColumn, columnIndex, onDrop, onDragEnd]);

  const handleEmptyColumnClick = useCallback(() => {
    if (isDragging && isValidTarget) {
      onDrop();
    }
  }, [isDragging, isValidTarget, onDrop]);

  // Calculate total height needed
  const totalHeight = cards.length > 0 
    ? getCardTop(cards.length - 1) + 70 
    : 0;

  return (
    <div
      ref={columnRef}
      className={cn(
        "relative flex-1 min-w-0",
        "rounded-lg transition-all duration-200",
        isValidTarget && isDragging && "bg-gold/20 ring-2 ring-gold/50",
      )}
      onPointerUp={handlePointerUp}
    >
      <ColumnFirework isActive={showFirework} onComplete={handleFireworkComplete} />
      
      {cards.length === 0 ? (
        <div 
          onClick={handleEmptyColumnClick}
          className={cn(
            "aspect-[2.5/3.5] rounded-lg",
            "border-2 border-dashed border-muted-foreground/30",
            "bg-muted/10 transition-all",
            isValidTarget && isDragging && "border-gold bg-gold/10 scale-105 cursor-pointer",
          )}
        />
      ) : (
        <div 
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
                className={cn(
                  "absolute left-0 right-0 transition-all duration-200",
                  dragging && "opacity-50 scale-95",
                )}
                style={{
                  top: `${top}px`,
                  zIndex: dragging ? 50 + index : index,
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
  );
};
