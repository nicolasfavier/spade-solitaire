import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SuitSelectorProps {
  onSelect: (suitCount: 1 | 2 | 4) => void;
  onCancel: () => void;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-secondary border border-border rounded-2xl p-6 max-w-sm mx-4 animate-scale-in shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-xl font-bold text-gold">
            New Game
          </h2>
          <button 
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-muted-foreground text-sm mb-5">
          Choose difficulty level:
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => onSelect(1)}
            className="w-full p-4 rounded-xl bg-success/20 border border-success/30 hover:bg-success/30 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">1 Suit</span>
                <p className="text-xs text-muted-foreground mt-0.5">Easy - ♠ only</p>
              </div>
              <span className="text-2xl">♠</span>
            </div>
          </button>

          <button
            onClick={() => onSelect(2)}
            className="w-full p-4 rounded-xl bg-gold/20 border border-gold/30 hover:bg-gold/30 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">2 Suits</span>
                <p className="text-xs text-muted-foreground mt-0.5">Medium - ♠ ♥</p>
              </div>
              <span className="text-2xl">♠ <span className="text-red-500">♥</span></span>
            </div>
          </button>

          <button
            onClick={() => onSelect(4)}
            className="w-full p-4 rounded-xl bg-accent/20 border border-accent/30 hover:bg-accent/30 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">4 Suits</span>
                <p className="text-xs text-muted-foreground mt-0.5">Hard - ♠ ♥ ♦ ♣</p>
              </div>
              <span className="text-xl">♠ <span className="text-red-500">♥ ♦</span> ♣</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
