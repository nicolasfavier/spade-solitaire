import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RefreshCw } from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  canUndo,
}) => {
  return (
    <div className="flex gap-2">
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
