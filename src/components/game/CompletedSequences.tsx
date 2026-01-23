import React from 'react';
import { cn } from '@/lib/utils';

interface CompletedSequencesProps {
  count: number;
}

const SpadeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)}>
    <path d="M50 5 C20 40, 5 55, 5 70 C5 85, 20 95, 35 85 C40 82, 45 75, 50 65 C50 80, 45 95, 35 95 L65 95 C55 95, 50 80, 50 65 C55 75, 60 82, 65 85 C80 95, 95 85, 95 70 C95 55, 80 40, 50 5Z" />
  </svg>
);

export const CompletedSequences: React.FC<CompletedSequencesProps> = ({ count }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300",
              i < count ? "text-gold" : "text-muted-foreground/30",
              i < count && "animate-scale-in",
            )}
          >
            <SpadeIcon className="w-full h-full" />
          </div>
        ))}
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground font-medium">{count}/8</span>
    </div>
  );
};
