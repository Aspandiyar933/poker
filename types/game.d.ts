export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type Round = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type Card = { suit: Suit; rank: Rank };

export type Player = {
  id: string;
  name: string;
  chips: number;
  hand: Card[];
  hasFolded: boolean;
  isAllin: boolean;
  currentBet: number; 
}