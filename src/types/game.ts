export interface Card {
  id: string;
  rank: number; // 1 (Ace) to 13 (King)
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  isFaceUp: boolean;
}

export interface GameState {
  tableau: Card[][];
  stock: Card[];
  completedSequences: number;
  moves: Move[];
  isWon: boolean;
  suitCount: 1 | 2 | 4;
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
export const SUITS: Array<'spades' | 'hearts' | 'diamonds' | 'clubs'> = ['spades', 'hearts', 'diamonds', 'clubs'];

export const getRankDisplay = (rank: number): string => RANKS[rank - 1];

export const isRedSuit = (suit: Card['suit']): boolean => suit === 'hearts' || suit === 'diamonds';
