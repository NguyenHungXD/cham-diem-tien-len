import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import {
  CardGameContext,
  CardGameContextType,
} from '../Contexts/CardGameContext';
import {
  CardGameState,
  cardGameStateSchema,
  createDefaultCardGameState,
} from '../Types/CardGame';
import { useRoomSync, RoomStatus } from '../Hooks/useRoomSync';
import { createRoom as apiCreateRoom, joinRoom as apiJoinRoom } from '../Utils/roomApi';

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

const getRoomFromUrl = () => {
  const m = window.location.pathname.match(/^\/room\/([A-Za-z0-9]+)/);
  if (m) return m[1];
  return null;
};

export const CardGameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CardGameState>(loadInitialState);
  const [roomId, setRoomId] = useState<string | null>(getRoomFromUrl);

  // Khởi tạo token và status từ localStorage (không dùng effect)
  const initPlayerToken = roomId ? localStorage.getItem(`roomToken_${roomId}`) : null;
  const [playerToken, setPlayerToken] = useState<string | null>(initPlayerToken);

  const initRoomStatus: RoomStatus = roomId
    ? initPlayerToken
      ? 'synced'
      : 'idle'
    : 'none';
  const [roomStatus, setRoomStatus] = useState<RoomStatus>(initRoomStatus);
  const remoteVersionRef = useRef(0);

  const onRemoteState = useCallback((remoteState: CardGameState, version: number) => {
    remoteVersionRef.current = version;
    setState(remoteState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
  }, []);

  const { pushState, stopPolling } = useRoomSync(
    roomId,
    playerToken,
    onRemoteState
  );

  const withSync = useCallback(
    (fn: (prev: CardGameState) => CardGameState) => {
      setState((prev) => {
        const next = fn(prev);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (roomId && playerToken) {
          pushState();
        }
        return next;
      });
    },
    [roomId, playerToken, pushState]
  );

  // Recompute leader
  const ctxValue = useMemo((): CardGameContextType => {
    const totals: Record<number, number> = {};
    for (const p of state.players) {
      totals[p.index] = state.rounds.reduce(
        (sum, r) => sum + (r.scores[p.index] ?? 0),
        0
      );
    }

    const computeFinished = (rounds: typeof state.rounds) => {
      if (state.mode === 'rounds') {
        return rounds.length >= state.totalRounds;
      }
      return state.players.some(
        (p) =>
          rounds.reduce((sum, r) => sum + (r.scores[p.index] ?? 0), 0) >=
          state.maxScore
      );
    };

    let leaderIndex: number | null = null;
    if (state.rounds.length > 0) {
      let best = -Infinity;
      for (const p of state.players) {
        if (totals[p.index] > best) {
          best = totals[p.index];
          leaderIndex = p.index;
        }
      }
    }

    const startMatch = () =>
      withSync((prev) => ({ ...prev, started: true, finished: false, rounds: [] }));

    const addRound = (scores: Record<number, number>) =>
      withSync((prev) => {
        const newRounds = [...prev.rounds, { id: crypto.randomUUID(), scores }];
        return { ...prev, rounds: newRounds, finished: computeFinished(newRounds) };
      });

    const editRound = (roundId: string, scores: Record<number, number>) =>
      withSync((prev) => {
        const newRounds = prev.rounds.map((r) =>
          r.id === roundId ? { ...r, scores } : r
        );
        return { ...prev, rounds: newRounds, finished: computeFinished(newRounds) };
      });

    const deleteRound = (roundId: string) =>
      withSync((prev) => {
        const newRounds = prev.rounds.filter((r) => r.id !== roundId);
        return { ...prev, rounds: newRounds, finished: computeFinished(newRounds) };
      });

    const setMaxScore = (maxScore: number) =>
      withSync((prev) => ({ ...prev, maxScore }));

    const setPlayerName = (index: number, name: string) =>
      withSync((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.index === index ? { ...p, name } : p)),
      }));

    const setPlayerEmoji = (index: number, emoji: string) =>
      withSync((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.index === index ? { ...p, emoji } : p)),
      }));

    const setPlayerColor = (index: number, color: string) =>
      withSync((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.index === index ? { ...p, color } : p)),
      }));

    const setGameMode = (mode: 'score' | 'rounds') =>
      withSync((prev) => ({ ...prev, mode }));

    const setTotalRounds = (totalRounds: number) =>
      withSync((prev) => ({ ...prev, totalRounds }));

    const finishMatch = () => withSync((prev) => ({ ...prev, finished: true }));

    const resetMatch = () =>
      withSync((prev) => ({
        ...createDefaultCardGameState(),
        players: prev.players,
        maxScore: prev.maxScore,
        totalRounds: prev.totalRounds,
        mode: prev.mode,
      }));

    // Room functions
    const createRoom = async () => {
      const host = state.players[0];
      setRoomStatus('creating');
      try {
        const { roomId: rid, playerToken: pt } = await apiCreateRoom(host.name, host.emoji, host.color);
        setRoomId(rid);
        setPlayerToken(pt);
        localStorage.setItem(`roomToken_${rid}`, pt);
        remoteVersionRef.current = 1;
        window.history.pushState({}, '', `/room/${rid}`);
        setRoomStatus('synced');
      } catch {
        setRoomStatus('error');
      }
    };

    const joinRoomAction = async (
      rid: string,
      name: string,
      emoji: string,
      color: string
    ) => {
      try {
        const { playerToken: pt } = await apiJoinRoom(rid, name, emoji, color);
        setPlayerToken(pt);
        localStorage.setItem(`roomToken_${rid}`, pt);
        remoteVersionRef.current = 1;
        setRoomStatus('synced');
        // Update URL to reflect joined room
        window.history.pushState({}, '', `/room/${rid}`);
      } catch {
        setRoomStatus('error');
      }
    };

    const copyRoomLink = () => {
      if (!roomId) return;
      const url = `${window.location.origin}/room/${roomId}`;
      navigator.clipboard.writeText(url).catch(() => {});
    };

    const leaveRoom = () => {
      setRoomId(null);
      setPlayerToken(null);
      setRoomStatus('none');
      stopPolling();
      window.history.pushState({}, '', '/');
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
      setGameMode,
      setTotalRounds,
      finishMatch,
      resetMatch,
      roomStatus,
      roomId,
      roomUrl: roomId ? `${window.location.origin}/room/${roomId}` : null,
      createRoom,
      joinRoom: joinRoomAction,
      copyRoomLink,
      leaveRoom,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, roomId, playerToken, roomStatus]);

  return (
    <CardGameContext.Provider value={ctxValue}>
      {children}
    </CardGameContext.Provider>
  );
};
