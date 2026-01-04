import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RefreshCw, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onHint: () => void;
  canUndo: boolean;
  hasHint: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  onHint,
  canUndo,
  hasHint,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="game"
        size="sm"
        onClick={onHint}
        disabled={!hasHint}
        className="gap-1.5"
      >
        <Lightbulb className="w-4 h-4" />
        <span className="hidden sm:inline">Joker</span>
      </Button>
      
      <Button
        variant="game"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="gap-1.5"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Undo</span>
      </Button>
      
      <Button
        variant="gamePrimary"
        size="sm"
        onClick={onNewGame}
        className="gap-1.5"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden sm:inline">New Game</span>
      </Button>
    </div>
  );
};
