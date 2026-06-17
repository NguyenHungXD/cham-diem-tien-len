import { useEffect, useRef } from 'react';
import { getRoomState, updateRoomState } from '../Utils/roomApi';
import type { CardGameState } from '../Types/CardGame';

export type RoomStatus = 'none' | 'creating' | 'synced' | 'expired' | 'error' | 'idle';

export const useRoomSync = (
  roomId: string | null,
  playerToken: string | null,
  onRemoteState: (state: CardGameState, version: number) => void
) => {
  const remoteVersionRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onRemoteStateRef = useRef(onRemoteState);
  const roomIdRef = useRef(roomId);
  const playerTokenRef = useRef(playerToken);
  const stopPollingRef = useRef<() => void>(() => {});
  const pushStateRef = useRef<() => void>(() => {});

  // Sync refs in layout effect (not render body) to avoid lint errors
  useEffect(() => {
    onRemoteStateRef.current = onRemoteState;
    roomIdRef.current = roomId;
    playerTokenRef.current = playerToken;
  });

  const isRoom = !!roomId && !!playerToken;

  useEffect(() => {
    if (!isRoom) return;
    let active = true;

    const pollOnce = async () => {
      const rid = roomIdRef.current;
      if (!rid) return;
      try {
        const data = await getRoomState(rid);
        if (data.version > remoteVersionRef.current) {
          remoteVersionRef.current = data.version;
          onRemoteStateRef.current(
            {
              players: data.players.map((p, i) => ({
                index: i,
                name: p.name,
                color: p.color,
                emoji: p.emoji,
              })),
              rounds: data.rounds.map((r) => ({
                id: r.id,
                scores: Object.fromEntries(
                  Object.entries(r.scores).map(([k, v]) => [Number(k), v])
                ),
              })),
              mode: data.mode as CardGameState['mode'],
              maxScore: data.maxScore,
              totalRounds: data.totalRounds,
              started: data.started,
              finished: data.finished,
            },
            data.version
          );
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err) {
          const e = err as { status: number; expired?: boolean };
          if (e.status === 404 || e.expired) {
            if (active) stopPollingRef.current();
          }
        }
      }
    };

    const pushState = async () => {
      const rid = roomIdRef.current;
      const pt = playerTokenRef.current;
      const version = remoteVersionRef.current;
      if (!rid || !pt) return;
      const raw = localStorage.getItem('tienLenGame');
      if (!raw) return;
      const ls = JSON.parse(raw);
      try {
        const res = await updateRoomState(rid, pt, version, {
          rounds: ls.rounds,
          started: ls.started,
          finished: ls.finished,
          mode: ls.mode,
          maxScore: ls.maxScore,
          totalRounds: ls.totalRounds,
        });
        remoteVersionRef.current = res.version;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err) {
          const e = err as { status: number; currentVersion?: number };
          if (e.status === 409 && e.currentVersion) {
            remoteVersionRef.current = e.currentVersion;
            pollOnce();
          }
        }
      }
    };

    stopPollingRef.current = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    pollOnce();
    intervalRef.current = setInterval(pollOnce, 3000);
    pushStateRef.current = pushState;

    return () => {
      active = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRoom]);  

  return {
    pushState: () => pushStateRef.current(),
    stopPolling: () => stopPollingRef.current(),
  };
};
