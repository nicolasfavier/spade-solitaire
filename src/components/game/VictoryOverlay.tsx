import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw } from 'lucide-react';

interface VictoryOverlayProps {
  onPlayAgain: () => void;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({ onPlayAgain }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-secondary border border-border rounded-2xl p-8 max-w-sm mx-4 text-center animate-scale-in shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
          <Trophy className="w-10 h-10 text-gold" />
        </div>
        
        <h2 className="font-display text-3xl font-bold text-gold mb-2">
          Victory!
        </h2>
        
        <p className="text-muted-foreground mb-6">
          Congratulations! You've completed all 8 sequences!
        </p>
        
        <Button
          variant="gamePrimary"
          size="lg"
          onClick={onPlayAgain}
          className="gap-2 w-full"
        >
          <RefreshCw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    </div>
  );
};
