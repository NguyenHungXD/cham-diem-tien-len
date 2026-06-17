import { createContext } from 'react';
import { CardGameState } from '../Types/CardGame';

export type CardGameContextType = {
  state: CardGameState;
  totals: Record<number, number>;
  leaderIndex: number | null;
  startMatch: () => void;
  addRound: (scores: Record<number, number>) => void;
  editRound: (roundId: string, scores: Record<number, number>) => void;
  deleteRound: (roundId: string) => void;
  setMaxScore: (maxScore: number) => void;
  setPlayerName: (index: number, name: string) => void;
  setPlayerEmoji: (index: number, emoji: string) => void;
  setPlayerColor: (index: number, color: string) => void;
  setGameMode: (mode: 'score' | 'rounds') => void;
  setTotalRounds: (totalRounds: number) => void;
  finishMatch: () => void;
  resetMatch: () => void;
  // Chia sẻ game state qua URL
  shareLink: () => void;
};

export const CardGameContext = createContext<CardGameContextType | null>(null);
