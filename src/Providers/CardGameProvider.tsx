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

    // Tính lại trạng thái kết thúc từ một danh sách ván bất kỳ
    const computeFinished = (rounds: typeof state.rounds) =>
      state.players.some(
        (p) =>
          rounds.reduce((sum, r) => sum + (r.scores[p.index] ?? 0), 0) >=
          state.maxScore
      );

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

      setStateAndLocalStorage({
        ...state,
        rounds: newRounds,
        finished: computeFinished(newRounds),
      });
    };

    const editRound = (roundId: string, scores: Record<number, number>) => {
      const newRounds = state.rounds.map((round) =>
        round.id === roundId ? { ...round, scores } : round
      );
      setStateAndLocalStorage({
        ...state,
        rounds: newRounds,
        finished: computeFinished(newRounds),
      });
    };

    const deleteRound = (roundId: string) => {
      const newRounds = state.rounds.filter((round) => round.id !== roundId);
      setStateAndLocalStorage({
        ...state,
        rounds: newRounds,
        finished: computeFinished(newRounds),
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

    const setPlayerEmoji = (index: number, emoji: string) => {
      setStateAndLocalStorage({
        ...state,
        players: state.players.map((p) =>
          p.index === index ? { ...p, emoji } : p
        ),
      });
    };

    const setPlayerColor = (index: number, color: string) => {
      setStateAndLocalStorage({
        ...state,
        players: state.players.map((p) =>
          p.index === index ? { ...p, color } : p
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
      setPlayerEmoji,
      setPlayerColor,
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
