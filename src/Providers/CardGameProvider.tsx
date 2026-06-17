import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { CardGameContext, CardGameContextType } from '../Contexts/CardGameContext';
import { CardGameState, cardGameStateSchema, createDefaultCardGameState } from '../Types/CardGame';
import { useSupabaseRoom } from '../Hooks/useSupabaseRoom';

const STORAGE_KEY = 'tienLenGame';

const loadInitial = (): CardGameState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createDefaultCardGameState();
  const parsed = cardGameStateSchema.safeParse(JSON.parse(saved));
  if (!parsed.success) return createDefaultCardGameState();
  return parsed.data;
};

const getRoomFromUrl = () => {
  const m = window.location.pathname.match(/^\/room\/([A-Za-z0-9]+)/);
  return m ? m[1] : null;
};

export const CardGameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CardGameState>(loadInitial);

  const setBoth = useCallback((next: CardGameState) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const onRemoteState = useCallback((remote: CardGameState) => {
    setBoth(remote);
  }, [setBoth]);

  // Khi room được tạo xong, tự động start match
  const handleRoomCreated = useCallback(() => {
    setState(prev => {
      const next = { ...prev, started: true, finished: false, rounds: [] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const { roomId, roomStatus, create, join, pushState, copyLink, leave } = useSupabaseRoom(state, onRemoteState, handleRoomCreated);

  // Auto-join room từ URL
  const urlRoomId = getRoomFromUrl();
  useEffect(() => {
    if (urlRoomId) join(urlRoomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const withSync = useCallback((fn: (prev: CardGameState) => CardGameState) => {
    setState(prev => {
      const next = fn(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const ctxValue = useMemo((): CardGameContextType => {
    const totals: Record<number, number> = {};
    for (const p of state.players) totals[p.index] = state.rounds.reduce((s, r) => s + (r.scores[p.index] ?? 0), 0);

    const computeFinished = (rounds: typeof state.rounds) => {
      if (state.mode === 'rounds') return rounds.length >= state.totalRounds;
      return state.players.some(p => rounds.reduce((s, r) => s + (r.scores[p.index] ?? 0), 0) >= state.maxScore);
    };

    let leaderIndex: number | null = null;
    if (state.rounds.length > 0) {
      let best = -Infinity;
      for (const p of state.players) { if (totals[p.index] > best) { best = totals[p.index]; leaderIndex = p.index; } }
    }

    const startMatch = () => withSync(p => ({ ...p, started: true, finished: false, rounds: [] }));
    const addRound = (scores: Record<number, number>) => withSync(p => {
      const nr = [...p.rounds, { id: crypto.randomUUID(), scores }];
      return { ...p, rounds: nr, finished: computeFinished(nr) };
    });
    const editRound = (roundId: string, scores: Record<number, number>) => withSync(p => {
      const nr = p.rounds.map(r => r.id === roundId ? { ...r, scores } : r);
      return { ...p, rounds: nr, finished: computeFinished(nr) };
    });
    const deleteRound = (roundId: string) => withSync(p => {
      const nr = p.rounds.filter(r => r.id !== roundId);
      return { ...p, rounds: nr, finished: computeFinished(nr) };
    });
    const setMaxScore = (maxScore: number) => withSync(p => ({ ...p, maxScore }));
    const setPlayerName = (i: number, name: string) => withSync(p => ({ ...p, players: p.players.map(pl => pl.index === i ? { ...pl, name } : pl) }));
    const setPlayerEmoji = (i: number, emoji: string) => withSync(p => ({ ...p, players: p.players.map(pl => pl.index === i ? { ...pl, emoji } : pl) }));
    const setPlayerColor = (i: number, color: string) => withSync(p => ({ ...p, players: p.players.map(pl => pl.index === i ? { ...pl, color } : pl) }));
    const setGameMode = (mode: 'score' | 'rounds') => withSync(p => ({ ...p, mode }));
    const setTotalRounds = (totalRounds: number) => withSync(p => ({ ...p, totalRounds }));
    const finishMatch = () => withSync(p => ({ ...p, finished: true }));
    const resetMatch = () => withSync(p => ({ ...createDefaultCardGameState(), players: p.players, maxScore: p.maxScore, totalRounds: p.totalRounds, mode: p.mode }));

    return {
      state, totals, leaderIndex,
      startMatch, addRound, editRound, deleteRound,
      setMaxScore, setPlayerName, setPlayerEmoji, setPlayerColor,
      setGameMode, setTotalRounds, finishMatch, resetMatch,
      roomId, roomStatus,
      createRoom: create, joinRoom: join, pushRoomState: pushState,
      copyRoomLink: copyLink, leaveRoom: leave,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, roomId, roomStatus]);

  return <CardGameContext.Provider value={ctxValue}>{children}</CardGameContext.Provider>;
};
