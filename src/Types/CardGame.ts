import { z } from 'zod';

export const presetColors = [
  '#D08182', // Muted Pink
  '#5AAB9E', // Teal
  '#D58B5A', // Burnt Orange
  '#697A9A', // Soft Indigo
  '#78B2D3', // Pastel Blue
  '#A785BA', // Lilac
  '#D9C17C', // Muted Yellow
  '#FF907F', // Light Coral
];

export const NUMBER_OF_PLAYERS = 4;

// Điểm theo thứ hạng: Nhất +3, Nhì +2, Ba +1, Bét 0
export const RANK_POINTS = [3, 2, 1, 0];

export const DEFAULT_MAX_SCORE = 50;

export type CardPlayer = {
  index: number;
  name: string;
  color: string;
};

export type RoundEntry = {
  id: string;
  // Tổng điểm cộng trong ván này theo từng playerIndex (đã gồm điểm hạng + thưởng)
  scores: Record<number, number>;
};

export type CardGameState = {
  players: CardPlayer[];
  rounds: RoundEntry[];
  maxScore: number;
  started: boolean;
  finished: boolean;
};

export const cardPlayerSchema = z.object({
  index: z.number(),
  name: z.string(),
  color: z.string(),
});

export const roundEntrySchema = z.object({
  id: z.string(),
  scores: z.record(z.coerce.number(), z.number()),
});

export const cardGameStateSchema = z.object({
  players: z.array(cardPlayerSchema),
  rounds: z.array(roundEntrySchema),
  maxScore: z.number().min(1).max(9999),
  started: z.boolean(),
  finished: z.boolean(),
});

export const createDefaultCardGameState = (): CardGameState => {
  const players: CardPlayer[] = Array.from(
    { length: NUMBER_OF_PLAYERS },
    (_, i) => ({
      index: i,
      name: `Người chơi ${i + 1}`,
      color: presetColors[i % presetColors.length],
    })
  );

  return {
    players,
    rounds: [],
    maxScore: DEFAULT_MAX_SCORE,
    started: false,
    finished: false,
  };
};
