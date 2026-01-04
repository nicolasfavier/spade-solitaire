import React from 'react';
import { Card, DragInfo } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { cn } from '@/lib/utils';

interface TableauColumnProps {
  cards: Card[];
  columnIndex: number;
  isValidTarget: boolean;
  selectedInfo: { column: number; index: number } | null;
  hintInfo?: { fromColumn: number; fromIndex: number; toColumn: number } | null;
  onCardClick: (columnIndex: number, cardIndex: number) => void;
  onEmptyClick: () => void;
}

export const TableauColumn: React.FC<TableauColumnProps> = ({
  cards,
  columnIndex,
  isValidTarget,
  selectedInfo,
  hintInfo,
  onCardClick,
  onEmptyClick,
}) => {
  // Overlap adaptatif pour toujours voir le rang des cartes
  const getCardOverlap = () => {
    if (cards.length <= 5) return 28;
    if (cards.length <= 7) return 24;
    if (cards.length <= 10) return 22;
    if (cards.length <= 13) return 20;
    return 18;
  };
  const cardOverlap = getCardOverlap();
  
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

  return (
    <div
      className={cn(
        "relative flex-1 min-w-0",
        "rounded-lg transition-all duration-200",
        isValidTarget && "bg-gold/20",
        isHintTarget && "bg-success/20",
      )}
    >
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
        <div className="relative" style={{ paddingBottom: `${(cards.length - 1) * cardOverlap + 56}px` }}>
          {cards.map((card, index) => {
            const isTop = index === cards.length - 1;
            const isSelected = isCardSelected(index);
            const isInSelectedSequence = selectedInfo && 
              selectedInfo.column === columnIndex && 
              index >= selectedInfo.index;
            const cardIsHinted = isHinted(index);
            const offset = getCardOffset(index);

            return (
              <div
                key={card.id}
                className={cn(
                  "absolute left-0 right-0 transition-all duration-200",
                  isInSelectedSequence && "z-30",
                  cardIsHinted && "z-20",
                )}
                style={{
                  top: `${index * cardOverlap + offset}px`,
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
