import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen felt-texture flex flex-col items-center justify-center p-6 text-center">
      {/* Decorative cards */}
      <div className="absolute top-10 left-10 w-16 h-24 bg-card rounded-lg card-shadow rotate-[-15deg] opacity-20" />
      <div className="absolute top-20 right-16 w-16 h-24 bg-card rounded-lg card-shadow rotate-[20deg] opacity-20" />
      <div className="absolute bottom-20 left-20 w-16 h-24 bg-card rounded-lg card-shadow rotate-[10deg] opacity-20" />
      <div className="absolute bottom-10 right-10 w-16 h-24 bg-card rounded-lg card-shadow rotate-[-20deg] opacity-20" />
      
      {/* Main content */}
      <div className="relative z-10 max-w-md animate-fade-in">
        {/* Logo/Title */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center gold-glow">
            <span className="text-5xl">♠️</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gold mb-2">
            Spider Solitaire
          </h1>
          <p className="text-muted-foreground text-lg">
            Le jeu de cartes classique
          </p>
        </div>

        {/* Dedication */}
        <div className="bg-secondary/50 border border-border/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
            <span className="text-gold font-display text-lg">Dédicace</span>
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
          </div>
          <p className="text-foreground/90 leading-relaxed">
            Application gratuite sans pub dédiée à toutes les grand-mères
          </p>
          <p className="text-gold font-display text-xl mt-3">
            et plus particulièrement ma Balala ❤️
          </p>
        </div>

        {/* Start button */}
        <Button
          variant="gamePrimary"
          size="lg"
          onClick={onStart}
          className="w-full text-lg py-6 animate-pulse-gold"
        >
          Jouer
        </Button>

        {/* Footer */}
        <p className="text-muted-foreground text-xs mt-8">
          Glissez-déposez les cartes pour les déplacer
        </p>
      </div>
    </div>
  );
};
