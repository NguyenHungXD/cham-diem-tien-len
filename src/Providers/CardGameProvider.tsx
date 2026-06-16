import { ReactNode, useMemo, useState } from 'react';
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

  const setStateAndLocalStorage = (next: CardGameState) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const ctxValue = useMemo((): CardGameContextType => {
    const totals: Record<number, number> = {};
    for (const player of state.players) {
      totals[player.index] = state.rounds.reduce(
        (sum, round) => sum + (round.scores[player.index] ?? 0),
        0
      );
    }

    let leaderIndex: number | null = null;
    if (state.rounds.length > 0) {
      let best = -Infinity;
      for (const player of state.players) {
        if (totals[player.index] > best) {
          best = totals[player.index];
          leaderIndex = player.index;
        }
      }
    }

    const startMatch = () => {
      setStateAndLocalStorage({
        ...state,
        started: true,
        finished: false,
        rounds: [],
      });
    };

    const addRound = (scores: Record<number, number>) => {
      const newRounds = [
        ...state.rounds,
        { id: crypto.randomUUID(), scores },
      ];

      const newTotals: Record<number, number> = {};
      for (const player of state.players) {
        newTotals[player.index] = newRounds.reduce(
          (sum, round) => sum + (round.scores[player.index] ?? 0),
          0
        );
      }
      const reachedMax = state.players.some(
        (p) => newTotals[p.index] >= state.maxScore
      );

      setStateAndLocalStorage({
        ...state,
        rounds: newRounds,
        finished: reachedMax,
      });
    };

    const editRound = (roundId: string, scores: Record<number, number>) => {
      setStateAndLocalStorage({
        ...state,
        rounds: state.rounds.map((round) =>
          round.id === roundId ? { ...round, scores } : round
        ),
      });
    };

    const deleteRound = (roundId: string) => {
      setStateAndLocalStorage({
        ...state,
        rounds: state.rounds.filter((round) => round.id !== roundId),
      });
    };

    const setMaxScore = (maxScore: number) => {
      setStateAndLocalStorage({ ...state, maxScore });
    };

    const setPlayerName = (index: number, name: string) => {
      setStateAndLocalStorage({
        ...state,
        players: state.players.map((p) =>
          p.index === index ? { ...p, name } : p
        ),
      });
    };

    const finishMatch = () => {
      setStateAndLocalStorage({ ...state, finished: true });
    };

    const resetMatch = () => {
      const fresh = createDefaultCardGameState();
      // Giữ lại tên người chơi và điểm tối đa
      setStateAndLocalStorage({
        ...fresh,
        players: state.players,
        maxScore: state.maxScore,
      });
    };

    return {
      state,
      totals,
      leaderIndex,
      startMatch,
      addRound,
      editRound,
      deleteRound,
      setMaxScore,
      setPlayerName,
      finishMatch,
      resetMatch,
    };
  }, [state]);

  return (
    <CardGameContext.Provider value={ctxValue}>
      {children}
    </CardGameContext.Provider>
  );
};
