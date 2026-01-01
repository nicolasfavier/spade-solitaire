import React, { useState, useCallback } from 'react';
import { useSpiderSolitaire } from '@/hooks/useSpiderSolitaire';
import { TableauColumn } from './TableauColumn';
import { StockPile } from './StockPile';
import { CompletedSequences } from './CompletedSequences';
import { GameControls } from './GameControls';
import { VictoryOverlay } from './VictoryOverlay';
import { SuitSelector } from './SuitSelector';

export const SpiderSolitaire: React.FC = () => {
  const {
    gameState,
    newGame,
    moveCards,
    dealFromStock,
    undo,
    canDragFrom,
    getValidDropTargets,
    canUndo,
    canDeal,
    hasEmptyColumn,
  } = useSpiderSolitaire();

  const [selectedInfo, setSelectedInfo] = useState<{ column: number; index: number } | null>(null);
  const [validTargets, setValidTargets] = useState<number[]>([]);
  const [showSuitSelector, setShowSuitSelector] = useState(false);

  const handleCardClick = useCallback((columnIndex: number, cardIndex: number) => {
    // If clicking on a selected card, deselect
    if (selectedInfo && selectedInfo.column === columnIndex && selectedInfo.index === cardIndex) {
      setSelectedInfo(null);
      setValidTargets([]);
      return;
    }

    // If we have a selection and click elsewhere
    if (selectedInfo) {
      // Check if clicking on a valid target
      if (validTargets.includes(columnIndex)) {
        const cards = gameState.tableau[selectedInfo.column].slice(selectedInfo.index);
        moveCards({
          cards,
          fromColumn: selectedInfo.column,
          fromIndex: selectedInfo.index,
        }, columnIndex);
        setSelectedInfo(null);
        setValidTargets([]);
        return;
      }
      
      // Otherwise, try to select new cards
      setSelectedInfo(null);
      setValidTargets([]);
    }

    // Try to select cards from this position
    if (canDragFrom(columnIndex, cardIndex)) {
      const cards = gameState.tableau[columnIndex].slice(cardIndex);
      setSelectedInfo({ column: columnIndex, index: cardIndex });
      setValidTargets(getValidDropTargets(cards));
    }
  }, [selectedInfo, validTargets, gameState.tableau, canDragFrom, getValidDropTargets, moveCards]);

  const handleEmptyColumnClick = useCallback((columnIndex: number) => {
    if (selectedInfo && validTargets.includes(columnIndex)) {
      const cards = gameState.tableau[selectedInfo.column].slice(selectedInfo.index);
      moveCards({
        cards,
        fromColumn: selectedInfo.column,
        fromIndex: selectedInfo.index,
      }, columnIndex);
      setSelectedInfo(null);
      setValidTargets([]);
    }
  }, [selectedInfo, validTargets, gameState.tableau, moveCards]);

  const handleBackgroundClick = useCallback(() => {
    if (selectedInfo) {
      setSelectedInfo(null);
      setValidTargets([]);
    }
  }, [selectedInfo]);

  const handleNewGame = useCallback(() => {
    setShowSuitSelector(true);
  }, []);

  const handleSuitSelect = useCallback((suitCount: 1 | 2 | 4) => {
    newGame(suitCount);
    setShowSuitSelector(false);
    setSelectedInfo(null);
    setValidTargets([]);
  }, [newGame]);

  const remainingDeals = Math.floor(gameState.stock.length / 10);

  return (
    <div 
      className="min-h-screen felt-texture flex flex-col"
      onClick={handleBackgroundClick}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-lg sm:text-xl font-bold text-gold">
            Spider
          </h1>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
            {gameState.suitCount} {gameState.suitCount === 1 ? 'suit' : 'suits'}
          </span>
        </div>
        <GameControls
          onNewGame={handleNewGame}
          onUndo={undo}
          canUndo={canUndo}
        />
      </header>

      {/* Game area */}
      <main 
        className="flex-1 flex flex-col p-2 sm:p-4 gap-3 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tableau */}
        <div className="flex-1 flex gap-1 sm:gap-1.5 min-h-0 overflow-y-auto">
          {gameState.tableau.map((cards, index) => (
            <TableauColumn
              key={index}
              cards={cards}
              columnIndex={index}
              isValidTarget={validTargets.includes(index)}
              selectedInfo={selectedInfo}
              onCardClick={handleCardClick}
              onEmptyClick={() => handleEmptyColumnClick(index)}
            />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-end justify-between px-1">
          <StockPile
            remainingDeals={remainingDeals}
            canDeal={canDeal}
            hasEmptyColumn={hasEmptyColumn}
            onDeal={dealFromStock}
          />
          
          <CompletedSequences count={gameState.completedSequences} />
        </div>
      </main>

      {/* Victory overlay */}
      {gameState.isWon && (
        <VictoryOverlay onPlayAgain={handleNewGame} />
      )}

      {/* Suit selector */}
      {showSuitSelector && (
        <SuitSelector 
          onSelect={handleSuitSelect}
          onCancel={() => setShowSuitSelector(false)}
        />
      )}
    </div>
  );
};
