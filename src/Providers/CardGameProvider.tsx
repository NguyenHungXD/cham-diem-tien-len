import { ReactNode, useCallback, useMemo, useState } from 'react';
import {
  CardGameContext,
  CardGameContextType,
} from '../Contexts/CardGameContext';
import {
  CardGameState,
  cardGameStateSchema,
  createDefaultCardGameState,
} from '../Types/CardGame';

const STORAGE_KEY = 'tienLenGame';

const loadInitialState = (): CardGameState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createDefaultCardGameState();
  const parsed = cardGameStateSchema.safeParse(JSON.parse(saved));
  if (!parsed.success) {
    console.error('invalid card game state, using default');
    return createDefaultCardGameState();
  }
  return parsed.data;
};

export const CardGameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CardGameState>(loadInitialState);

  const withSync = useCallback(
    (fn: (prev: CardGameState) => CardGameState) => {
      setState((prev) => {
        const next = fn(prev);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const ctxValue = useMemo((): CardGameContextType => {
    const totals: Record<number, number> = {};
    for (const p of state.players) {
      totals[p.index] = state.rounds.reduce(
        (sum, r) => sum + (r.scores[p.index] ?? 0), 0
      );
    }

    const computeFinished = (rounds: typeof state.rounds) => {
      if (state.mode === 'rounds') return rounds.length >= state.totalRounds;
      return state.players.some(
        (p) => rounds.reduce((sum, r) => sum + (r.scores[p.index] ?? 0), 0) >= state.maxScore
      );
    };

    let leaderIndex: number | null = null;
    if (state.rounds.length > 0) {
      let best = -Infinity;
      for (const p of state.players) {
        if (totals[p.index] > best) { best = totals[p.index]; leaderIndex = p.index; }
      }
    }

    const startMatch = () => withSync((prev) => ({ ...prev, started: true, finished: false, rounds: [] }));
    const addRound = (scores: Record<number, number>) =>
      withSync((prev) => {
        const newRounds = [...prev.rounds, { id: crypto.randomUUID(), scores }];
        return { ...prev, rounds: newRounds, finished: computeFinished(newRounds) };
      });
    const editRound = (roundId: string, scores: Record<number, number>) =>
      withSync((prev) => {
        const newRounds = prev.rounds.map((r) => r.id === roundId ? { ...r, scores } : r);
        return { ...prev, rounds: newRounds, finished: computeFinished(newRounds) };
      });
    const deleteRound = (roundId: string) =>
      withSync((prev) => {
        const newRounds = prev.rounds.filter((r) => r.id !== roundId);
        return { ...prev, rounds: newRounds, finished: computeFinished(newRounds) };
      });
    const setMaxScore = (maxScore: number) => withSync((prev) => ({ ...prev, maxScore }));
    const setPlayerName = (index: number, name: string) =>
      withSync((prev) => ({ ...prev, players: prev.players.map((p) => p.index === index ? { ...p, name } : p) }));
    const setPlayerEmoji = (index: number, emoji: string) =>
      withSync((prev) => ({ ...prev, players: prev.players.map((p) => p.index === index ? { ...p, emoji } : p) }));
    const setPlayerColor = (index: number, color: string) =>
      withSync((prev) => ({ ...prev, players: prev.players.map((p) => p.index === index ? { ...p, color } : p) }));
    const setGameMode = (mode: 'score' | 'rounds') => withSync((prev) => ({ ...prev, mode }));
    const setTotalRounds = (totalRounds: number) => withSync((prev) => ({ ...prev, totalRounds }));
    const finishMatch = () => withSync((prev) => ({ ...prev, finished: true }));
    const resetMatch = () =>
      withSync((prev) => ({
        ...createDefaultCardGameState(),
        players: prev.players, maxScore: prev.maxScore, totalRounds: prev.totalRounds, mode: prev.mode,
      }));

    // Chia sẻ: encode state vào hash URL, copy link
    const shareLink = () => {
      // Chỉ share rounds và players (không cần mode/maxScore vì mỗi máy tự có)
      const shareData = { r: state.rounds, s: state.started, f: state.finished };
      const encoded = btoa(JSON.stringify(shareData));
      const url = `${window.location.origin}${window.location.pathname}?game=${encoded}`;
      navigator.clipboard.writeText(url).catch(() => {});
    };

    return {
      state, totals, leaderIndex,
      startMatch, addRound, editRound, deleteRound,
      setMaxScore, setPlayerName, setPlayerEmoji, setPlayerColor,
      setGameMode, setTotalRounds, finishMatch, resetMatch,
      shareLink,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <CardGameContext.Provider value={ctxValue}>
      {children}
    </CardGameContext.Provider>
  );
};
