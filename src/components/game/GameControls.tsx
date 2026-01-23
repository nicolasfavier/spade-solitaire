import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RotateCcw, RefreshCw, Sparkles } from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onJoker: () => void;
  onDebugWin?: () => void;
  canUndo: boolean;
  canJoker: boolean;
  showDropIndicator: boolean;
  onToggleDropIndicator: (value: boolean) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  onJoker,
  onDebugWin,
  canUndo,
  canJoker,
  showDropIndicator,
  onToggleDropIndicator,
}) => {
  const isDev = import.meta.env.DEV;
  return (
    <div className="flex items-center gap-1 portrait:gap-0.5 sm:gap-3">
      <div className="flex items-center gap-1 portrait:gap-0.5 sm:gap-2">
        <Switch
          id="drop-indicator"
          checked={showDropIndicator}
          onCheckedChange={onToggleDropIndicator}
          className="scale-[0.65] portrait:scale-[0.6] sm:scale-90"
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
        className="gap-1 portrait:gap-0.5 portrait:px-2 portrait:h-7"
      >
        <Sparkles className="w-3.5 h-3.5 portrait:w-3 portrait:h-3 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Joker</span>
      </Button>

      <Button
        variant="game"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="gap-1 portrait:gap-0.5 portrait:px-2 portrait:h-7"
      >
        <RotateCcw className="w-3.5 h-3.5 portrait:w-3 portrait:h-3 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Annuler</span>
      </Button>

      {isDev && onDebugWin && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDebugWin}
          className="gap-1.5"
          title="Debug: Forcer la victoire"
        >
          <span>🏆</span>
        </Button>
      )}

      <Button
        variant="gamePrimary"
        size="sm"
        onClick={onNewGame}
        className="gap-1 portrait:gap-0.5 portrait:px-2 portrait:h-7"
      >
        <RefreshCw className="w-3.5 h-3.5 portrait:w-3 portrait:h-3 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Nouvelle partie</span>
      </Button>
    </div>
  );
};
