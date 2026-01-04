import React, { useState, useCallback } from 'react';
import { Card, DragInfo } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { ColumnFirework } from './ColumnFirework';
import { cn } from '@/lib/utils';

interface TableauColumnProps {
  cards: Card[];
  columnIndex: number;
  isValidTarget: boolean;
  selectedInfo: { column: number; index: number } | null;
  hintInfo?: { fromColumn: number; fromIndex: number; toColumn: number } | null;
  showFirework?: boolean;
  onCardClick: (columnIndex: number, cardIndex: number) => void;
  onEmptyClick: () => void;
  onFireworkComplete?: () => void;
}

export const TableauColumn: React.FC<TableauColumnProps> = ({
  cards,
  columnIndex,
  isValidTarget,
  selectedInfo,
  hintInfo,
  showFirework = false,
  onCardClick,
  onEmptyClick,
  onFireworkComplete,
}) => {
  // Adaptive overlap - more space for face-down cards to see rank of face-up cards
  const getCardOverlap = (card: Card, index: number, totalCards: number) => {
    const isFaceUp = card.isFaceUp;
    
    // Face-down cards get minimal overlap (8-12px) to save space
    // Face-up cards get more overlap (20-28px) to show rank clearly
    if (!isFaceUp) {
      return 10; // Minimal overlap for face-down cards
    }
    
    // Face-up cards need more space to show ranks
    const faceUpCount = cards.filter(c => c.isFaceUp).length;
    if (faceUpCount <= 5) return 28;
    if (faceUpCount <= 8) return 24;
    if (faceUpCount <= 12) return 20;
    return 18;
  };

  // Calculate cumulative top position for each card
  const getCardTop = (cardIndex: number): number => {
    let top = 0;
    for (let i = 0; i < cardIndex; i++) {
      top += getCardOverlap(cards[i], i, cards.length);
    }
    return top;
  };
  
  const isCardSelected = (cardIndex: number) => {
    if (!selectedInfo) return false;
    return selectedInfo.column === columnIndex && cardIndex >= selectedInfo.index;
  };

  const isHinted = (cardIndex: number) => {
    if (!hintInfo) return false;
    return hintInfo.fromColumn === columnIndex && cardIndex >= hintInfo.fromIndex;
  };

  const isHintTarget = hintInfo && hintInfo.toColumn === columnIndex;

  // Calculate offset for cards ABOVE selection (they move down to reveal selected card)
  const getCardOffset = (cardIndex: number) => {
    if (!selectedInfo || selectedInfo.column !== columnIndex) return 0;
    // Cards ABOVE the selected sequence should move DOWN
    if (cardIndex > selectedInfo.index) return 12;
    return 0;
  };

  const handleFireworkComplete = useCallback(() => {
    onFireworkComplete?.();
  }, [onFireworkComplete]);

  // Calculate total height needed
  const totalHeight = cards.length > 0 
    ? getCardTop(cards.length - 1) + 56 
    : 0;

  return (
    <div
      className={cn(
        "relative flex-1 min-w-0",
        "rounded-lg transition-all duration-200",
        isValidTarget && "bg-gold/20",
        isHintTarget && "bg-success/20",
      )}
    >
      <ColumnFirework isActive={showFirework} onComplete={handleFireworkComplete} />
      
      {cards.length === 0 ? (
        <div 
          onClick={onEmptyClick}
          className={cn(
            "aspect-[2.5/3.5] rounded-lg cursor-pointer",
            "border-2 border-dashed border-muted-foreground/30",
            "bg-muted/10 transition-all",
            isValidTarget && "border-gold bg-gold/10 scale-105",
            isHintTarget && "border-success bg-success/10 animate-pulse",
          )}
        />
      ) : (
        <div className="relative" style={{ paddingBottom: `${totalHeight}px` }}>
          {cards.map((card, index) => {
            const isTop = index === cards.length - 1;
            const isSelected = isCardSelected(index);
            const isInSelectedSequence = selectedInfo && 
              selectedInfo.column === columnIndex && 
              index >= selectedInfo.index;
            const cardIsHinted = isHinted(index);
            const offset = getCardOffset(index);
            const top = getCardTop(index);

            return (
              <div
                key={card.id}
                className={cn(
                  "absolute left-0 right-0 transition-all duration-200",
                  isInSelectedSequence && "z-30",
                  cardIsHinted && "z-20",
                )}
                style={{
                  top: `${top + offset}px`,
                  zIndex: isInSelectedSequence ? 30 + index : (cardIsHinted ? 20 + index : index),
                  transform: isInSelectedSequence ? 'scale(1.05)' : undefined,
                }}
              >
                <PlayingCard
                  card={card}
                  isTop={isTop}
                  isSelected={isSelected}
                  isHinted={cardIsHinted}
                  isValidTarget={isTop && isValidTarget && !selectedInfo}
                  onClick={() => card.isFaceUp && onCardClick(columnIndex, index)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
