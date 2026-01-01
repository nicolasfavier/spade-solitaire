import React from 'react';
import { Card, DragInfo } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { cn } from '@/lib/utils';

interface TableauColumnProps {
  cards: Card[];
  columnIndex: number;
  isValidTarget: boolean;
  selectedInfo: { column: number; index: number } | null;
  onCardClick: (columnIndex: number, cardIndex: number) => void;
  onEmptyClick: () => void;
}

export const TableauColumn: React.FC<TableauColumnProps> = ({
  cards,
  columnIndex,
  isValidTarget,
  selectedInfo,
  onCardClick,
  onEmptyClick,
}) => {
  const cardOverlap = cards.length > 10 ? 16 : cards.length > 8 ? 20 : cards.length > 6 ? 24 : 28;
  
  const isCardSelected = (cardIndex: number) => {
    if (!selectedInfo) return false;
    return selectedInfo.column === columnIndex && cardIndex >= selectedInfo.index;
  };

  return (
    <div
      className={cn(
        "relative flex-1 min-w-0",
        "rounded-lg transition-all duration-200",
        isValidTarget && "bg-gold/20",
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

            return (
              <div
                key={card.id}
                className={cn(
                  "absolute left-0 right-0",
                  isInSelectedSequence && "z-30",
                )}
                style={{
                  top: `${index * cardOverlap}px`,
                  zIndex: isInSelectedSequence ? 30 + index : index,
                }}
              >
                <PlayingCard
                  card={card}
                  isTop={isTop}
                  isSelected={isSelected}
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
