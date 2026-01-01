import React from 'react';
import { Card, getRankDisplay } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  card: Card;
  isTop?: boolean;
  isDragging?: boolean;
  isValidTarget?: boolean;
  style?: React.CSSProperties;
  onDragStart?: () => void;
}

const SpadeSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={cn("fill-current", className)}
  >
    <path d="M50 5 C20 40, 5 55, 5 70 C5 85, 20 95, 35 85 C40 82, 45 75, 50 65 C50 80, 45 95, 35 95 L65 95 C55 95, 50 80, 50 65 C55 75, 60 82, 65 85 C80 95, 95 85, 95 70 C95 55, 80 40, 50 5Z" />
  </svg>
);

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isTop = false,
  isDragging = false,
  isValidTarget = false,
  style,
  onDragStart,
}) => {
  const rankDisplay = getRankDisplay(card.rank);
  
  if (!card.isFaceUp) {
    return (
      <div
        className={cn(
          "relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden",
          "bg-[hsl(220,70%,35%)] card-shadow",
          "border-2 border-[hsl(220,70%,45%)]",
        )}
        style={style}
      >
        {/* Card back pattern */}
        <div className="absolute inset-1 rounded-md overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  hsl(220, 70%, 40%) 0px,
                  hsl(220, 70%, 40%) 2px,
                  hsl(220, 70%, 32%) 2px,
                  hsl(220, 70%, 32%) 4px
                )
              `,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[hsl(220,70%,45%)] rounded-full opacity-30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden",
        "bg-card card-shadow cursor-grab active:cursor-grabbing",
        "border border-border/20",
        "transition-all duration-200",
        isDragging && "opacity-90 scale-105 card-shadow-hover z-50",
        isValidTarget && "ring-2 ring-gold animate-pulse-gold",
        isTop && "hover:translate-y-[-2px] hover:card-shadow-hover",
      )}
      style={style}
      onTouchStart={onDragStart}
      onMouseDown={onDragStart}
    >
      {/* Card face */}
      <div className="absolute inset-0 p-1 flex flex-col text-card-foreground">
        {/* Top left rank/suit */}
        <div className="flex flex-col items-center leading-none">
          <span className="text-[0.6rem] sm:text-xs font-bold">{rankDisplay}</span>
          <SpadeSVG className="w-2 h-2 sm:w-3 sm:h-3" />
        </div>

        {/* Center suit */}
        <div className="flex-1 flex items-center justify-center">
          <SpadeSVG className="w-6 h-6 sm:w-10 sm:h-10" />
        </div>

        {/* Bottom right rank/suit (rotated) */}
        <div className="flex flex-col items-center leading-none rotate-180">
          <span className="text-[0.6rem] sm:text-xs font-bold">{rankDisplay}</span>
          <SpadeSVG className="w-2 h-2 sm:w-3 sm:h-3" />
        </div>
      </div>
    </div>
  );
};
