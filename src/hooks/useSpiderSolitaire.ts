import { useState, useCallback, useEffect } from 'react';
import { Card, GameState, Move, DragInfo } from '@/types/game';

const COLUMNS = 10;
const MAX_UNDO = 5;

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  // 8 complete sets of Ace through King (104 cards total)
  for (let set = 0; set < 8; set++) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        id: `${set}-${rank}`,
        rank,
        suit: 'spades',
        isFaceUp: false,
      });
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

  // Deal cards to tableau
  // First 4 columns get 6 cards, rest get 5
  for (let col = 0; col < COLUMNS; col++) {
    const cardCount = col < 4 ? 6 : 5;
    for (let i = 0; i < cardCount; i++) {
      const card = { ...deck[cardIndex] };
      // Only the top card is face up
      if (i === cardCount - 1) {
        card.isFaceUp = true;
      }
      tableau[col].push(card);
      cardIndex++;
    }
  }

  // Remaining 50 cards go to stock
  const stock = deck.slice(cardIndex);

  return { tableau, stock };
};

const checkForCompleteSequence = (column: Card[]): { hasComplete: boolean; startIndex: number } => {
  if (column.length < 13) return { hasComplete: false, startIndex: -1 };

  // Look for a complete King to Ace sequence at the bottom of the column
  for (let startIndex = column.length - 13; startIndex >= 0; startIndex--) {
    let isComplete = true;
    for (let i = 0; i < 13; i++) {
      const card = column[startIndex + i];
      if (!card.isFaceUp || card.rank !== 13 - i) {
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

const isValidMove = (cards: Card[], targetColumn: Card[]): boolean => {
  if (targetColumn.length === 0) return true;
  
  const topCard = targetColumn[targetColumn.length - 1];
  const movingCard = cards[0];
  
  return topCard.rank === movingCard.rank + 1;
};

const canMoveSequence = (column: Card[], fromIndex: number): boolean => {
  // Check if cards from fromIndex to end form a valid descending sequence
  for (let i = fromIndex; i < column.length - 1; i++) {
    if (!column[i].isFaceUp) return false;
    if (column[i].rank !== column[i + 1].rank + 1) return false;
  }
  return column[fromIndex].isFaceUp;
};

const STORAGE_KEY = 'spider-solitaire-game';

export const useSpiderSolitaire = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // If parsing fails, start new game
      }
    }
    
    const deck = shuffleDeck(createDeck());
    const { tableau, stock } = dealCards(deck);
    return {
      tableau,
      stock,
      completedSequences: 0,
      moves: [],
      isWon: false,
    };
  });

  // Save to localStorage whenever game state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const newGame = useCallback(() => {
    const deck = shuffleDeck(createDeck());
    const { tableau, stock } = dealCards(deck);
    setGameState({
      tableau,
      stock,
      completedSequences: 0,
      moves: [],
      isWon: false,
    });
  }, []);

  const moveCards = useCallback((dragInfo: DragInfo, toColumn: number) => {
    setGameState(prev => {
      const { fromColumn, fromIndex, cards } = dragInfo;
      
      if (fromColumn === toColumn) return prev;
      if (!isValidMove(cards, prev.tableau[toColumn])) return prev;

      const newTableau = prev.tableau.map(col => [...col]);
      
      // Remove cards from source column
      const removedCards = newTableau[fromColumn].splice(fromIndex);
      
      // Add cards to target column
      newTableau[toColumn].push(...removedCards);

      // Flip the new top card if needed
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

      // Check for complete sequence
      const { hasComplete, startIndex } = checkForCompleteSequence(newTableau[toColumn]);
      let newCompletedSequences = prev.completedSequences;
      
      if (hasComplete) {
        newTableau[toColumn].splice(startIndex, 13);
        newCompletedSequences++;
        
        // Flip new top card after removing sequence
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
        previousTableau: prev.tableau,
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
  }, []);

  const dealFromStock = useCallback(() => {
    setGameState(prev => {
      if (prev.stock.length === 0) return prev;
      
      // Check if any column is empty
      const hasEmptyColumn = prev.tableau.some(col => col.length === 0);
      if (hasEmptyColumn) return prev; // Can't deal with empty columns

      const newTableau = prev.tableau.map(col => [...col]);
      const newStock = [...prev.stock];

      // Deal one card to each column
      for (let i = 0; i < COLUMNS && newStock.length > 0; i++) {
        const card = { ...newStock.pop()!, isFaceUp: true };
        newTableau[i].push(card);
      }

      // Check for complete sequences after dealing
      let newCompletedSequences = prev.completedSequences;
      for (let col = 0; col < COLUMNS; col++) {
        const { hasComplete, startIndex } = checkForCompleteSequence(newTableau[col]);
        if (hasComplete) {
          newTableau[col].splice(startIndex, 13);
          newCompletedSequences++;
          
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
        previousTableau: prev.tableau,
        previousStock: prev.stock,
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
    return canMoveSequence(gameState.tableau[column], cardIndex);
  }, [gameState.tableau]);

  const getValidDropTargets = useCallback((cards: Card[]): number[] => {
    return gameState.tableau
      .map((col, index) => ({ col, index }))
      .filter(({ col }) => isValidMove(cards, col))
      .map(({ index }) => index);
  }, [gameState.tableau]);

  const hasEmptyColumn = gameState.tableau.some(col => col.length === 0);

  return {
    gameState,
    newGame,
    moveCards,
    dealFromStock,
    undo,
    canDragFrom,
    getValidDropTargets,
    canUndo: gameState.moves.length > 0,
    canDeal: gameState.stock.length > 0 && !hasEmptyColumn,
    hasEmptyColumn,
  };
};
