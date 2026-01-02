import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw, Heart } from 'lucide-react';
import { Fireworks } from './Fireworks';

interface VictoryOverlayProps {
  onPlayAgain: () => void;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({ onPlayAgain }) => {
  return (
    <>
      <Fireworks />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm animate-fade-in">
        <div className="bg-secondary border border-gold/30 rounded-2xl p-8 max-w-sm mx-4 text-center animate-scale-in shadow-2xl gold-glow">
          <div className="w-24 h-24 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center animate-pulse-gold">
            <Trophy className="w-12 h-12 text-gold" />
          </div>
          
          <h2 className="font-display text-4xl font-bold text-gold mb-2">
            🎉 Victoire ! 🎉
          </h2>
          
          <p className="text-foreground mb-2">
            Félicitations ! Tu as complété les 8 séquences !
          </p>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="text-sm">Balala serait fière de toi</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          </div>
          
          <Button
            variant="gamePrimary"
            size="lg"
            onClick={onPlayAgain}
            className="gap-2 w-full"
          >
            <RefreshCw className="w-5 h-5" />
            Rejouer
          </Button>
        </div>
      </div>
    </>
  );
};
