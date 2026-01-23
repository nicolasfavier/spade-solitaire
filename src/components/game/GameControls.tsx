import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RotateCcw, RefreshCw, Sparkles } from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onJoker: () => void;
  canUndo: boolean;
  canJoker: boolean;
  showDropIndicator: boolean;
  onToggleDropIndicator: (value: boolean) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  onJoker,
  canUndo,
  canJoker,
  showDropIndicator,
  onToggleDropIndicator,
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Switch
          id="drop-indicator"
          checked={showDropIndicator}
          onCheckedChange={onToggleDropIndicator}
          className="scale-75 sm:scale-90"
        />
        <label htmlFor="drop-indicator" className="text-xs sm:text-sm text-muted-foreground hidden sm:inline cursor-pointer">
          Aide
        </label>
      </div>

      <Button
        variant="game"
        size="sm"
        onClick={onJoker}
        disabled={!canJoker}
        className="gap-1.5"
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Joker</span>
      </Button>

      <Button
        variant="game"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="gap-1.5"
      >
        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Undo</span>
      </Button>

      <Button
        variant="gamePrimary"
        size="sm"
        onClick={onNewGame}
        className="gap-1.5"
      >
        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">New Game</span>
      </Button>
    </div>
  );
};
