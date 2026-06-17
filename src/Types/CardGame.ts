import { z } from 'zod';

export const presetColors = [
  '#F0648C', // Hồng
  '#3FBFA8', // Ngọc
  '#F2994A', // Cam
  '#6C7BD6', // Tím xanh
  '#56A8E8', // Xanh dương
  '#B07BD6', // Tử đinh hương
  '#E0C04A', // Vàng
  '#FF7B6B', // San hô
];

// Bảng emoji để chọn làm avatar cho mỗi người chơi
export const presetEmojis = [
  '🐱',
  '🐶',
  '🦊',
  '🐼',
  '🐯',
  '🦁',
  '🐸',
  '🐵',
  '🐧',
  '🦄',
  '🐲',
  '🦖',
  '👑',
  '🤖',
  '👻',
  '🎩',
  '🌟',
  '🔥',
  '⚡',
  '🍀',
];

export const NUMBER_OF_PLAYERS = 4;

// Điểm theo thứ hạng: Nhất +3, Nhì +2, Ba +1, Bét 0
export const RANK_POINTS = [3, 2, 1, 0];

export const DEFAULT_MAX_SCORE = 50;

export const DEFAULT_TOTAL_ROUNDS = 10;

// Chế độ chơi: theo điểm về đích, hoặc theo số ván cố định
export type GameMode = 'score' | 'rounds';

export type CardPlayer = {
  index: number;
  name: string;
  color: string;
  emoji: string;
};

export type RoundEntry = {
  id: string;
  // Tổng điểm cộng trong ván này theo từng playerIndex (đã gồm điểm hạng + thưởng)
  scores: Record<number, number>;
};

export type CardGameState = {
  players: CardPlayer[];
  rounds: RoundEntry[];
  mode: GameMode;
  maxScore: number;
  totalRounds: number;
  started: boolean;
  finished: boolean;
};

export const cardPlayerSchema = z.object({
  index: z.number(),
  name: z.string(),
  color: z.string(),
  emoji: z.string().default('🐱'),
});

export const roundEntrySchema = z.object({
  id: z.string(),
  scores: z.record(z.coerce.number(), z.number()),
});

export const cardGameStateSchema = z.object({
  players: z.array(cardPlayerSchema),
  rounds: z.array(roundEntrySchema),
  mode: z.enum(['score', 'rounds']).default('score'),
  maxScore: z.number().min(1).max(9999),
  totalRounds: z.number().min(1).max(999).default(10),
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
      emoji: presetEmojis[i % presetEmojis.length],
    })
  );

  return {
    players,
    rounds: [],
    mode: 'score',
    maxScore: DEFAULT_MAX_SCORE,
    totalRounds: DEFAULT_TOTAL_ROUNDS,
    started: false,
    finished: false,
  };
};
