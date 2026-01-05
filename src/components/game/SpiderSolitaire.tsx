import React, { useState, useCallback, useMemo } from 'react';
import { useSpiderSolitaire } from '@/hooks/useSpiderSolitaire';
import { TableauColumn } from './TableauColumn';
import { StockPile } from './StockPile';
import { CompletedSequences } from './CompletedSequences';
import { GameControls } from './GameControls';
import { VictoryOverlay } from './VictoryOverlay';
import { SuitSelector } from './SuitSelector';
import { WelcomeScreen } from './WelcomeScreen';

export const SpiderSolitaire: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(() => {
    // Show welcome if no saved game
    return !localStorage.getItem('spider-solitaire-game');
  });

  const {
    gameState,
    newGame,
    moveCards,
    dealFromStock,
    undo,
    canDragFrom,
    getValidDropTargets,
    getHint,
    canUndo,
    canDeal,
    hasEmptyColumn,
  } = useSpiderSolitaire();

  const [selectedInfo, setSelectedInfo] = useState<{ column: number; index: number } | null>(null);
  const [validTargets, setValidTargets] = useState<number[]>([]);
  const [showSuitSelector, setShowSuitSelector] = useState(false);
  const [hintInfo, setHintInfo] = useState<{ fromColumn: number; fromIndex: number; toColumn: number } | null>(null);
  const [fireworkColumns, setFireworkColumns] = useState<Set<number>>(new Set());

  // Memoize hasHint to avoid recalculating on every render
  const hasHint = useMemo(() => getHint() !== null, [getHint]);

  const triggerFirework = useCallback((columnIndex: number) => {
    setFireworkColumns(prev => new Set([...prev, columnIndex]));
  }, []);

  const handleFireworkComplete = useCallback((columnIndex: number) => {
    setFireworkColumns(prev => {
      const next = new Set(prev);
      next.delete(columnIndex);
      return next;
    });
  }, []);

  const handleCardClick = useCallback((columnIndex: number, cardIndex: number) => {
    // Clear hint when clicking
    setHintInfo(null);
    
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
        const completedColumn = moveCards({
          cards,
          fromColumn: selectedInfo.column,
          fromIndex: selectedInfo.index,
        }, columnIndex);
        
        // Trigger firework if a sequence was completed
        if (completedColumn !== null) {
          triggerFirework(completedColumn);
        }
        
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
  }, [selectedInfo, validTargets, gameState.tableau, canDragFrom, getValidDropTargets, moveCards, triggerFirework]);

  const handleEmptyColumnClick = useCallback((columnIndex: number) => {
    setHintInfo(null);
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

  const handleDeal = useCallback(() => {
    const completedColumns = dealFromStock();
    completedColumns.forEach(col => triggerFirework(col));
  }, [dealFromStock, triggerFirework]);

  const handleBackgroundClick = useCallback(() => {
    if (selectedInfo) {
      setSelectedInfo(null);
      setValidTargets([]);
    }
    setHintInfo(null);
  }, [selectedInfo]);

  const handleNewGame = useCallback(() => {
    setHintInfo(null);
    setShowSuitSelector(true);
  }, []);

  const handleSuitSelect = useCallback((suitCount: 1 | 2 | 4) => {
    newGame(suitCount);
    setShowSuitSelector(false);
    setSelectedInfo(null);
    setValidTargets([]);
    setHintInfo(null);
  }, [newGame]);

  const handleHint = useCallback(() => {
    const hint = getHint();
    if (!hint) return;

    // Only highlight destination column with a flash
    setHintInfo(hint);

    // Auto-clear hint after single flash animation (600ms)
    setTimeout(() => {
      setHintInfo(null);
    }, 600);
  }, [getHint]);

  const handleWelcomeStart = useCallback(() => {
    setShowWelcome(false);
    setShowSuitSelector(true);
  }, []);

  const remainingDeals = Math.floor(gameState.stock.length / 10);

  // Show welcome screen
  if (showWelcome) {
    return <WelcomeScreen onStart={handleWelcomeStart} />;
  }

  return (
    <div 
      className="min-h-screen felt-texture flex flex-col"
      onClick={handleBackgroundClick}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-border/30"
        onClick={(e) => e.stopPropagation()}
      >
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
          onHint={handleHint}
          canUndo={canUndo}
          hasHint={hasHint}
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
              hintInfo={hintInfo}
              showFirework={fireworkColumns.has(index)}
              onCardClick={handleCardClick}
              onEmptyClick={() => handleEmptyColumnClick(index)}
              onFireworkComplete={() => handleFireworkComplete(index)}
            />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-end justify-between px-1">
          <StockPile
            remainingDeals={remainingDeals}
            canDeal={canDeal}
            hasEmptyColumn={hasEmptyColumn}
            onDeal={handleDeal}
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
