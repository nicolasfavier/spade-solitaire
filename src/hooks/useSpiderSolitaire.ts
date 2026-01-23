import { useState, useCallback, useEffect } from 'react';
import { Card, GameState, Move, DragInfo, SUITS } from '@/types/game';

const COLUMNS = 10;
const MAX_UNDO = 5;

const cloneTableau = (tableau: Card[][]): Card[][] =>
  tableau.map(col => col.map(card => ({ ...card })));

const createDeck = (suitCount: 1 | 2 | 4): Card[] => {
  const deck: Card[] = [];
  const suitsToUse = SUITS.slice(0, suitCount);
  const setsPerSuit = 8 / suitCount;
  
  for (let set = 0; set < setsPerSuit; set++) {
    for (const suit of suitsToUse) {
      for (let rank = 1; rank <= 13; rank++) {
        deck.push({
          id: `${suit}-${set}-${rank}`,
          rank,
          suit,
          isFaceUp: false,
        });
      }
    }
  }
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const dealCards = (deck: Card[]): { tableau: Card[][]; stock: Card[] } => {
  const tableau: Card[][] = Array.from({ length: COLUMNS }, () => []);
  let cardIndex = 0;

  for (let col = 0; col < COLUMNS; col++) {
    const cardCount = col < 4 ? 6 : 5;
    for (let i = 0; i < cardCount; i++) {
      const card = { ...deck[cardIndex] };
      if (i === cardCount - 1) {
        card.isFaceUp = true;
      }
      tableau[col].push(card);
      cardIndex++;
    }
  }

  const stock = deck.slice(cardIndex);
  return { tableau, stock };
};

const checkForCompleteSequence = (column: Card[], suitCount: 1 | 2 | 4): { hasComplete: boolean; startIndex: number } => {
  if (column.length < 13) return { hasComplete: false, startIndex: -1 };

  for (let startIndex = column.length - 13; startIndex >= 0; startIndex--) {
    let isComplete = true;
    const targetSuit = column[startIndex].suit;
    
    for (let i = 0; i < 13; i++) {
      const card = column[startIndex + i];
      const mustMatchSuit = suitCount > 1;
      
      if (!card.isFaceUp || card.rank !== 13 - i) {
        isComplete = false;
        break;
      }
      if (mustMatchSuit && card.suit !== targetSuit) {
        isComplete = false;
        break;
      }
    }
    if (isComplete) {
      return { hasComplete: true, startIndex };
    }
  }

  return { hasComplete: false, startIndex: -1 };
};

const isValidMove = (cards: Card[], targetColumn: Card[], suitCount: 1 | 2 | 4): boolean => {
  if (targetColumn.length === 0) return true;
  
  const topCard = targetColumn[targetColumn.length - 1];
  const movingCard = cards[0];
  
  return topCard.rank === movingCard.rank + 1;
};

const canMoveSequence = (column: Card[], fromIndex: number, suitCount: 1 | 2 | 4): boolean => {
  if (!column[fromIndex].isFaceUp) return false;
  
  for (let i = fromIndex; i < column.length - 1; i++) {
    if (!column[i].isFaceUp) return false;
    if (column[i].rank !== column[i + 1].rank + 1) return false;
    // For multi-suit, sequences must be same suit to move together
    if (suitCount > 1 && column[i].suit !== column[i + 1].suit) return false;
  }
  return true;
};

const STORAGE_KEY = 'spider-solitaire-game';

export const useSpiderSolitaire = (initialSuitCount: 1 | 2 | 4 = 1) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.suitCount) return parsed;
      } catch {
        // Start new game
      }
    }
    
    const deck = shuffleDeck(createDeck(initialSuitCount));
    const { tableau, stock } = dealCards(deck);
    return {
      tableau,
      stock,
      completedSequences: 0,
      moves: [],
      isWon: false,
      suitCount: initialSuitCount,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const newGame = useCallback((suitCount: 1 | 2 | 4 = gameState.suitCount) => {
    const deck = shuffleDeck(createDeck(suitCount));
    const { tableau, stock } = dealCards(deck);
    setGameState({
      tableau,
      stock,
      completedSequences: 0,
      moves: [],
      isWon: false,
      suitCount,
    });
  }, [gameState.suitCount]);

  const moveCards = useCallback((dragInfo: DragInfo, toColumn: number): number | null => {
    let completedColumn: number | null = null;
    
    setGameState(prev => {
      const { fromColumn, fromIndex, cards } = dragInfo;
      
      if (fromColumn === toColumn) return prev;
      if (!isValidMove(cards, prev.tableau[toColumn], prev.suitCount)) return prev;

      const newTableau = cloneTableau(prev.tableau);
      
      const removedCards = newTableau[fromColumn].splice(fromIndex);
      newTableau[toColumn].push(...removedCards);

      let flippedCard: Move['flippedCard'] = undefined;
      if (newTableau[fromColumn].length > 0) {
        const topCard = newTableau[fromColumn][newTableau[fromColumn].length - 1];
        if (!topCard.isFaceUp) {
          topCard.isFaceUp = true;
          flippedCard = {
            column: fromColumn,
            cardIndex: newTableau[fromColumn].length - 1,
          };
        }
      }

      const { hasComplete, startIndex } = checkForCompleteSequence(newTableau[toColumn], prev.suitCount);
      let newCompletedSequences = prev.completedSequences;
      
      if (hasComplete) {
        newTableau[toColumn].splice(startIndex, 13);
        newCompletedSequences++;
        completedColumn = toColumn;
        
        if (newTableau[toColumn].length > 0) {
          const topCard = newTableau[toColumn][newTableau[toColumn].length - 1];
          if (!topCard.isFaceUp) {
            topCard.isFaceUp = true;
          }
        }
      }

      const move: Move = {
        type: hasComplete ? 'complete' : 'move',
        from: { column: fromColumn, cardIndex: fromIndex },
        to: { column: toColumn },
        cards: removedCards,
        flippedCard,
        previousTableau: cloneTableau(prev.tableau),
      };

      const newMoves = [...prev.moves.slice(-MAX_UNDO + 1), move];

      return {
        ...prev,
        tableau: newTableau,
        completedSequences: newCompletedSequences,
        moves: newMoves,
        isWon: newCompletedSequences === 8,
      };
    });
    
    return completedColumn;
  }, []);

  const dealFromStock = useCallback((): number[] => {
    let completedColumns: number[] = [];
    
    setGameState(prev => {
      if (prev.stock.length === 0) return prev;
      
      const hasEmptyColumn = prev.tableau.some(col => col.length === 0);
      if (hasEmptyColumn) return prev;

      const newTableau = cloneTableau(prev.tableau);
      const newStock = [...prev.stock];

      for (let i = 0; i < COLUMNS && newStock.length > 0; i++) {
        const card = { ...newStock.pop()!, isFaceUp: true };
        newTableau[i].push(card);
      }

      let newCompletedSequences = prev.completedSequences;
      for (let col = 0; col < COLUMNS; col++) {
        const { hasComplete, startIndex } = checkForCompleteSequence(newTableau[col], prev.suitCount);
        if (hasComplete) {
          newTableau[col].splice(startIndex, 13);
          newCompletedSequences++;
          completedColumns.push(col);
          
          if (newTableau[col].length > 0) {
            const topCard = newTableau[col][newTableau[col].length - 1];
            if (!topCard.isFaceUp) {
              topCard.isFaceUp = true;
            }
          }
        }
      }

      const move: Move = {
        type: 'deal',
        from: {},
        to: {},
        previousTableau: cloneTableau(prev.tableau),
        previousStock: prev.stock.map(c => ({ ...c })),
      };

      const newMoves = [...prev.moves.slice(-MAX_UNDO + 1), move];

      return {
        ...prev,
        tableau: newTableau,
        stock: newStock,
        completedSequences: newCompletedSequences,
        moves: newMoves,
        isWon: newCompletedSequences === 8,
      };
    });
    
    return completedColumns;
  }, []);

  const undo = useCallback(() => {
    setGameState(prev => {
      if (prev.moves.length === 0) return prev;

      const lastMove = prev.moves[prev.moves.length - 1];
      
      if (lastMove.previousTableau) {
        return {
          ...prev,
          tableau: lastMove.previousTableau,
          stock: lastMove.previousStock || prev.stock,
          completedSequences: lastMove.type === 'complete' 
            ? prev.completedSequences - 1 
            : prev.completedSequences,
          moves: prev.moves.slice(0, -1),
          isWon: false,
        };
      }

      return prev;
    });
  }, []);

  const canDragFrom = useCallback((column: number, cardIndex: number): boolean => {
    return canMoveSequence(gameState.tableau[column], cardIndex, gameState.suitCount);
  }, [gameState.tableau, gameState.suitCount]);

  const getValidDropTargets = useCallback((cards: Card[]): number[] => {
    return gameState.tableau
      .map((col, index) => ({ col, index }))
      .filter(({ col }) => isValidMove(cards, col, gameState.suitCount))
      .map(({ index }) => index);
  }, [gameState.tableau, gameState.suitCount]);

  const hasEmptyColumn = gameState.tableau.some(col => col.length === 0);

  // Find an interesting move suggestion
  const findInterestingMove = useCallback((): { fromColumn: number; toColumn: number } | null => {
    const { tableau, suitCount } = gameState;

    const candidates: Array<{
      fromColumn: number;
      fromIndex: number;
      toColumn: number;
      score: number;
    }> = [];

    for (let fromCol = 0; fromCol < COLUMNS; fromCol++) {
      const column = tableau[fromCol];
      if (column.length === 0) continue;

      // Find all movable sequences in this column
      for (let fromIdx = 0; fromIdx < column.length; fromIdx++) {
        if (!canMoveSequence(column, fromIdx, suitCount)) continue;

        const cards = column.slice(fromIdx);
        const hasFaceDownBelow = fromIdx > 0 && !column[fromIdx - 1].isFaceUp;

        // Check if card is already well-placed (same suit, correct sequence below it)
        const isAlreadyWellPlaced = fromIdx > 0 && column[fromIdx - 1].isFaceUp &&
                                     column[fromIdx - 1].suit === cards[0].suit &&
                                     column[fromIdx - 1].rank === cards[0].rank + 1;

        // Check all possible target columns
        for (let toCol = 0; toCol < COLUMNS; toCol++) {
          if (toCol === fromCol) continue;

          const targetColumn = tableau[toCol];
          if (!isValidMove(cards, targetColumn, suitCount)) continue;

          // Calculate move score (higher = more interesting)
          let score = 0;

          // Check if target creates same-suit sequence
          const targetCreatesSameSuit = targetColumn.length > 0 &&
                                         targetColumn[targetColumn.length - 1].suit === cards[0].suit;

          // REJECT: Moving a card that's already well-placed to another spot that's not better
          // Example: 3♠ already under 4♠, don't suggest moving it under another 4♥
          if (isAlreadyWellPlaced && !targetCreatesSameSuit) {
            continue;
          }

          // REJECT: Moving to same situation (e.g., 3 under 4 of different suit -> 3 under another 4 of different suit)
          if (isAlreadyWellPlaced && targetCreatesSameSuit &&
              column[fromIdx - 1].rank === targetColumn[targetColumn.length - 1].rank) {
            continue;
          }

          // Priority 1: Reveals a face-down card (very important!)
          if (hasFaceDownBelow) {
            score += 100;
          }

          // Priority 2: Builds same-suit sequence (essential for completion)
          if (targetCreatesSameSuit) {
            score += 60;

            // Bonus: Count how long the same-suit sequence would become
            let seqLength = cards.length;
            for (let i = targetColumn.length - 1; i >= 0; i--) {
              const card = targetColumn[i];
              const expectedRank = cards[0].rank + (targetColumn.length - i);
              if (card.suit === cards[0].suit && card.rank === expectedRank) {
                seqLength++;
              } else {
                break;
              }
            }
            score += seqLength * 3;
          } else {
            // Penalty: moving to different suit (unless revealing a card)
            if (!hasFaceDownBelow) {
              score -= 20;
            }
          }

          // Priority 3: Moving King to empty column is sometimes useful
          if (targetColumn.length === 0 && cards[0].rank === 13) {
            score += hasFaceDownBelow ? 40 : 10;
          }

          // Skip moves with negative or zero score
          if (score <= 0) continue;

          // Avoid moving to empty column unless it's a King or reveals a card
          if (targetColumn.length === 0 && cards[0].rank !== 13 && !hasFaceDownBelow) {
            continue;
          }

          candidates.push({ fromColumn: fromCol, fromIndex: fromIdx, toColumn: toCol, score });
        }
      }
    }

    if (candidates.length === 0) return null;

    // Sort by score and return the best move (only return column indices, not card index)
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    return { fromColumn: best.fromColumn, toColumn: best.toColumn };
  }, [gameState]);

  return {
    gameState,
    newGame,
    moveCards,
    dealFromStock,
    undo,
    canDragFrom,
    getValidDropTargets,
    findInterestingMove,
    canUndo: gameState.moves.length > 0,
    canDeal: gameState.stock.length > 0 && !hasEmptyColumn,
    hasEmptyColumn,
  };
};
