import React from 'react';
import { cn } from '@/lib/utils';

interface StockPileProps {
  remainingDeals: number;
  canDeal: boolean;
  hasEmptyColumn: boolean;
  onDeal: () => void;
}

export const StockPile: React.FC<StockPileProps> = ({
  remainingDeals,
  canDeal,
  hasEmptyColumn,
  onDeal,
}) => {
  const handleClick = () => {
    if (canDeal) {
      onDeal();
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5 portrait:gap-0">
      <button
        onClick={handleClick}
        disabled={!canDeal}
        className={cn(
          "relative w-10 h-14 portrait:w-9 portrait:h-12 sm:w-14 sm:h-20 rounded-lg",
          "transition-all duration-200",
          canDeal && "hover:scale-105 cursor-pointer active:scale-95",
          !canDeal && "cursor-not-allowed opacity-50",
        )}
      >
        {remainingDeals > 0 ? (
          <>
            {/* Stack effect */}
            {remainingDeals > 2 && (
              <div 
                className="absolute inset-0 rounded-lg bg-[hsl(220,70%,30%)] border border-[hsl(220,70%,40%)]"
                style={{ transform: 'translate(4px, 4px)' }}
              />
            )}
            {remainingDeals > 1 && (
              <div 
                className="absolute inset-0 rounded-lg bg-[hsl(220,70%,32%)] border border-[hsl(220,70%,42%)]"
                style={{ transform: 'translate(2px, 2px)' }}
              />
            )}
            {/* Top card */}
            <div 
              className={cn(
                "absolute inset-0 rounded-lg overflow-hidden",
                "bg-[hsl(220,70%,35%)] card-shadow",
                "border border-[hsl(220,70%,45%)]",
              )}
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
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 rounded-lg border-2 border-dashed border-muted-foreground/30" />
        )}
      </button>
      
      <span className="text-[10px] portrait:text-[9px] sm:text-sm text-muted-foreground font-medium">
        {remainingDeals > 0 ? `${remainingDeals} séries` : 'Vide'}
      </span>

      {hasEmptyColumn && remainingDeals > 0 && (
        <span className="text-[9px] portrait:text-[8px] sm:text-xs text-accent text-center leading-tight font-medium max-w-[80px] portrait:max-w-[70px]">
          Remplir colonnes vides
        </span>
      )}
    </div>
  );
};
