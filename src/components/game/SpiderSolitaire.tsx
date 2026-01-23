import React, { useState, useCallback, useEffect } from 'react';
import { useSpiderSolitaire } from '@/hooks/useSpiderSolitaire';
import { TableauColumn } from './TableauColumn';
import { StockPile } from './StockPile';
import { CompletedSequences } from './CompletedSequences';
import { GameControls } from './GameControls';
import { VictoryOverlay } from './VictoryOverlay';
import { SuitSelector } from './SuitSelector';
import { WelcomeScreen } from './WelcomeScreen';
import { DragOverlay } from './DragOverlay';
import { DragInfo, Card } from '@/types/game';

export const SpiderSolitaire: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(() => {
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
    findInterestingMove,
    forceWin,
    canUndo,
    canDeal,
    hasEmptyColumn,
  } = useSpiderSolitaire();

  const [showSuitSelector, setShowSuitSelector] = useState(false);
  const [fireworkColumns, setFireworkColumns] = useState<Set<number>>(new Set());
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [draggedCards, setDraggedCards] = useState<Card[]>([]);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [validTargets, setValidTargets] = useState<number[]>([]);
  const [showDropIndicator, setShowDropIndicator] = useState(() => {
    return localStorage.getItem('spider-show-drop-indicator') !== 'false';
  });
  const [jokerHint, setJokerHint] = useState<{ fromColumn: number; toColumn: number } | null>(null);

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

  const handleDragStart = useCallback((columnIndex: number, cardIndex: number, clientX: number, clientY: number) => {
    if (!canDragFrom(columnIndex, cardIndex)) return;
    
    const cards = gameState.tableau[columnIndex].slice(cardIndex);
    const info: DragInfo = { cards, fromColumn: columnIndex, fromIndex: cardIndex };
    setDragInfo(info);
    setDraggedCards(cards);
    setDragPosition({ x: clientX, y: clientY });
    setValidTargets(getValidDropTargets(cards));
  }, [canDragFrom, gameState.tableau, getValidDropTargets]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragInfo) return;
    setDragPosition({ x: clientX, y: clientY });
  }, [dragInfo]);

  const handleDragEnd = useCallback(() => {
    setDragInfo(null);
    setDraggedCards([]);
    setValidTargets([]);
  }, []);

  const handleDrop = useCallback((toColumn: number) => {
    if (!dragInfo) return;
    
    const completedColumn = moveCards(dragInfo, toColumn);
    if (completedColumn !== null) {
      triggerFirework(completedColumn);
    }
    
    setDragInfo(null);
    setDraggedCards([]);
    setValidTargets([]);
  }, [dragInfo, moveCards, triggerFirework]);

  // Global pointer move and up handlers
  useEffect(() => {
    if (!dragInfo) return;

    const handlePointerMove = (e: PointerEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      // Find which column we're over
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      let droppedOnColumn: number | null = null;
      
      for (const el of elements) {
        const columnAttr = el.getAttribute('data-column');
        if (columnAttr !== null) {
          droppedOnColumn = parseInt(columnAttr, 10);
          break;
        }
      }
      
      if (droppedOnColumn !== null && validTargets.includes(droppedOnColumn)) {
        handleDrop(droppedOnColumn);
      } else {
        handleDragEnd();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragInfo, validTargets, handleDragMove, handleDrop, handleDragEnd]);

  const handleDeal = useCallback(() => {
    const completedColumns = dealFromStock();
    completedColumns.forEach(col => triggerFirework(col));
  }, [dealFromStock, triggerFirework]);

  const handleNewGame = useCallback(() => {
    setShowSuitSelector(true);
  }, []);

  const handleSuitSelect = useCallback((suitCount: 1 | 2 | 4) => {
    newGame(suitCount);
    setShowSuitSelector(false);
    setDragInfo(null);
    setDraggedCards([]);
    setValidTargets([]);
    setJokerHint(null);
  }, [newGame]);

  const handleWelcomeStart = useCallback(() => {
    setShowWelcome(false);
    setShowSuitSelector(true);
  }, []);

  const handleJoker = useCallback(() => {
    const hint = findInterestingMove();
    if (hint) {
      setJokerHint(hint);
      // Auto-clear after highlighting
      setTimeout(() => setJokerHint(null), 1500);
    }
  }, [findInterestingMove]);

  const remainingDeals = Math.floor(gameState.stock.length / 10);

  if (showWelcome) {
    return <WelcomeScreen onStart={handleWelcomeStart} />;
  }

  return (
    <div className="min-h-screen felt-texture flex flex-col select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 border-b border-border/30">
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
          <h1 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-gold">
            Spider Balala
          </h1>
          <span className="text-xs sm:text-sm text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
            {gameState.suitCount} {gameState.suitCount === 1 ? 'couleur' : 'couleurs'}
          </span>
        </div>
        <GameControls
          onNewGame={handleNewGame}
          onUndo={undo}
          onJoker={handleJoker}
          onDebugWin={forceWin}
          canUndo={canUndo}
          canJoker={findInterestingMove() !== null}
          showDropIndicator={showDropIndicator}
          onToggleDropIndicator={(value) => {
            setShowDropIndicator(value);
            localStorage.setItem('spider-show-drop-indicator', String(value));
          }}
        />
      </header>

      {/* Game area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Tableau */}
        <div className="absolute inset-0 p-2 sm:p-3 md:p-4 lg:p-6 pb-24 sm:pb-28 overflow-y-auto">
          <div className="flex gap-1 sm:gap-1.5 md:gap-2.5 lg:gap-3 h-full">
            {gameState.tableau.map((cards, index) => (
              <TableauColumn
                key={index}
                cards={cards}
                columnIndex={index}
                isValidTarget={showDropIndicator && validTargets.includes(index)}
                isDragging={dragInfo !== null}
                dragFromColumn={dragInfo?.fromColumn ?? null}
                dragFromIndex={dragInfo?.fromIndex ?? null}
                showFirework={fireworkColumns.has(index)}
                isJokerHighlighted={jokerHint !== null && (jokerHint.fromColumn === index || jokerHint.toColumn === index)}
                onDragStart={handleDragStart}
                onFireworkComplete={() => handleFireworkComplete(index)}
              />
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          {/* Gradient overlay for smooth transition */}
          <div className="h-12 bg-gradient-to-t from-background/95 to-transparent" />
          <div className="bg-background/95 backdrop-blur-sm border-t border-border/30 px-3 sm:px-4 md:px-6 py-3 flex items-end justify-between pointer-events-auto">
            <StockPile
              remainingDeals={remainingDeals}
              canDeal={canDeal}
              hasEmptyColumn={hasEmptyColumn}
              onDeal={handleDeal}
            />

            <CompletedSequences count={gameState.completedSequences} />
          </div>
        </div>
      </main>

      {/* Drag overlay - floating cards that follow cursor */}
      {dragInfo && draggedCards.length > 0 && (
        <DragOverlay cards={draggedCards} position={dragPosition} />
      )}

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
