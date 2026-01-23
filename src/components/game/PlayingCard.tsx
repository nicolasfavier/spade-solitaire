import React from 'react';
import { Card, getRankDisplay, isRedSuit } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  card: Card;
  isTop?: boolean;
  isDragging?: boolean;
  isValidTarget?: boolean;
  style?: React.CSSProperties;
}

const SpadeSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)}>
    <path d="M50 5 C20 40, 5 55, 5 70 C5 85, 20 95, 35 85 C40 82, 45 75, 50 65 C50 80, 45 95, 35 95 L65 95 C55 95, 50 80, 50 65 C55 75, 60 82, 65 85 C80 95, 95 85, 95 70 C95 55, 80 40, 50 5Z" />
  </svg>
);

const HeartSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)}>
    <path d="M50 88 C20 60, 5 45, 5 30 C5 15, 20 5, 35 15 C42 20, 47 28, 50 35 C53 28, 58 20, 65 15 C80 5, 95 15, 95 30 C95 45, 80 60, 50 88Z" />
  </svg>
);

const DiamondSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)}>
    <path d="M50 5 L95 50 L50 95 L5 50 Z" />
  </svg>
);

const ClubSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)}>
    <circle cx="50" cy="30" r="22" />
    <circle cx="28" cy="55" r="22" />
    <circle cx="72" cy="55" r="22" />
    <path d="M42 55 L50 95 L58 55 Z" />
  </svg>
);

const SuitIcon: React.FC<{ suit: Card['suit']; className?: string }> = ({ suit, className }) => {
  switch (suit) {
    case 'hearts': return <HeartSVG className={className} />;
    case 'diamonds': return <DiamondSVG className={className} />;
    case 'clubs': return <ClubSVG className={className} />;
    default: return <SpadeSVG className={className} />;
  }
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isTop = false,
  isDragging = false,
  isValidTarget = false,
  style,
}) => {
  const rankDisplay = getRankDisplay(card.rank);
  const isRed = isRedSuit(card.suit);
  
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
            <div className="w-6 h-6 portrait:w-5 portrait:h-5 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[hsl(220,70%,45%)] rounded-full opacity-30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden",
        "bg-card card-shadow flex flex-col",
        "border border-border/20",
        "transition-all duration-150",
        isValidTarget && "ring-2 ring-gold/70",
        isTop && "cursor-grab active:cursor-grabbing",
      )}
      style={style}
    >
      {/* Top 20% - Always visible header with rank and suit */}
      <div className={cn(
        "h-[20%] min-h-[20%] flex items-center justify-center gap-0.5 px-1 portrait:px-0.5 sm:px-1.5 border-b border-border/10",
        "bg-card",
        isRed ? "text-red-600" : "text-card-foreground"
      )}>
        <span className="text-base portrait:text-sm sm:text-xl md:text-2xl font-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
          {rankDisplay}
        </span>
        <SuitIcon suit={card.suit} className="w-3.5 h-3.5 portrait:w-3 portrait:h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" />
      </div>

      {/* Bottom 80% - Can be hidden by next card, shows large suit icon */}
      <div className={cn(
        "flex-1 flex items-center justify-center",
        "bg-card",
        isRed ? "text-red-600" : "text-card-foreground"
      )}>
        <SuitIcon suit={card.suit} className="w-10 h-10 portrait:w-8 portrait:h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 opacity-90" />
      </div>
    </div>
  );
};
