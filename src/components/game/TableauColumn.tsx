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

  // Calculate offset for each card based on face up/down status
  const getCardOffset = (cardIndex: number): number => {
    let offset = 0;
    for (let i = 0; i < cardIndex; i++) {
      // Face down cards: 5% spacing, Face up cards: 20% spacing (to show header)
      offset += cards[i].isFaceUp ? 20 : 5;
    }
    return offset;
  };

  // Calculate minimum height needed to show all cards
  const minHeightPercent = cards.length > 0
    ? 100 + getCardOffset(cards.length - 1)
    : 0;

  return (
    <div className="relative flex-1 min-w-0 flex flex-col portrait:min-w-[70px] portrait:w-[70px] portrait:px-1.5">
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
          className="relative touch-none w-full"
          style={{
            paddingBottom: `${minHeightPercent * 1.4}%`, // Creates height based on width with aspect ratio
          }}
        >
          {cards.map((card, index) => {
            const isTop = index === cards.length - 1;
            const dragging = isBeingDragged(index);
            const offsetPercent = getCardOffset(index);

            return (
              <div
                key={card.id}
                data-column={columnIndex}
                className={cn(
                  "absolute left-0 right-0 top-0",
                  dragging && "opacity-0",
                )}
                style={{
                  transform: `translateY(${offsetPercent}%)`,
                  zIndex: index,
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
