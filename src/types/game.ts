export interface Card {
  id: string;
  rank: number; // 1 (Ace) to 13 (King)
  suit: 'spades';
  isFaceUp: boolean;
}

export interface GameState {
  tableau: Card[][];
  stock: Card[];
  completedSequences: number;
  moves: Move[];
  isWon: boolean;
}

export interface Move {
  type: 'move' | 'deal' | 'complete';
  from: {
    column?: number;
    cardIndex?: number;
  };
  to: {
    column?: number;
  };
  cards?: Card[];
  flippedCard?: {
    column: number;
    cardIndex: number;
  };
  previousTableau?: Card[][];
  previousStock?: Card[];
}

export interface DragInfo {
  cards: Card[];
  fromColumn: number;
  fromIndex: number;
}

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const getRankDisplay = (rank: number): string => RANKS[rank - 1];
