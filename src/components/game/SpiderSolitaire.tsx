import React, { useState, useCallback } from 'react';
import { useSpiderSolitaire } from '@/hooks/useSpiderSolitaire';
import { TableauColumn } from './TableauColumn';
import { StockPile } from './StockPile';
import { CompletedSequences } from './CompletedSequences';
import { GameControls } from './GameControls';
import { VictoryOverlay } from './VictoryOverlay';
import { DragInfo } from '@/types/game';

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

  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [validTargets, setValidTargets] = useState<number[]>([]);

  const handleDragStart = useCallback((info: DragInfo) => {
    setDragInfo(info);
    setValidTargets(getValidDropTargets(info.cards));
  }, [getValidDropTargets]);

  const handleDrop = useCallback((toColumn: number) => {
    if (dragInfo && validTargets.includes(toColumn)) {
      moveCards(dragInfo, toColumn);
    }
    setDragInfo(null);
    setValidTargets([]);
  }, [dragInfo, validTargets, moveCards]);

  const handleDragEnd = useCallback(() => {
    setDragInfo(null);
    setValidTargets([]);
  }, []);

  const remainingDeals = Math.floor(gameState.stock.length / 10);

  return (
    <div 
      className="min-h-screen felt-texture flex flex-col"
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-border/30">
        <h1 className="font-display text-lg sm:text-xl font-bold text-gold">
          Spider Solitaire
        </h1>
        <GameControls
          onNewGame={newGame}
          onUndo={undo}
          canUndo={canUndo}
        />
      </header>

      {/* Game area */}
      <main className="flex-1 flex flex-col p-2 sm:p-4 gap-3 overflow-hidden">
        {/* Tableau */}
        <div className="flex-1 flex gap-1 sm:gap-2 min-h-0">
          {gameState.tableau.map((cards, index) => (
            <TableauColumn
              key={index}
              cards={cards}
              columnIndex={index}
              isValidTarget={validTargets.includes(index)}
              onDragStart={handleDragStart}
              onDrop={() => handleDrop(index)}
              canDragFrom={(cardIndex) => canDragFrom(index, cardIndex)}
              dragInfo={dragInfo}
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
        <VictoryOverlay onPlayAgain={newGame} />
      )}
    </div>
  );
};
