import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoom, getRoom, updateRoomState, subscribeRoom, roomDataToGameState } from '../Utils/supabaseRoom';
import { RoomStatus } from '../Contexts/CardGameContext';
import { CardGameState } from '../Types/CardGame';

export const useSupabaseRoom = (
  state: CardGameState,
  onRemoteState: (state: CardGameState) => void,
  onCreated?: () => void,
) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('none');
  const [remoteVersion, setRemoteVersion] = useState(0);
  const latestRef = useRef(state);

  // Sync latest state ref
  useEffect(() => { latestRef.current = state; }, [state]);

  // Tạo phòng
  const create = useCallback(async () => {
    setRoomStatus('creating');
    try {
      const rid = await createRoom(state.players, state.mode, state.maxScore, state.totalRounds);
      setRoomId(rid);
      window.history.pushState({}, '', `/room/${rid}`);
      // Push player data ngay sau khi tạo phòng
      await updateRoomState(rid, state);
      setRemoteVersion(v => v + 1);
      setRoomStatus('synced');
      onCreated?.();
    } catch {
      setRoomStatus('error');
    }
  }, [state.players, state.mode, state.maxScore, state.totalRounds, onCreated]);

  // Join phòng (load state từ server)
  const join = useCallback(async (rid: string) => {
    setRoomId(rid);
    const data = await getRoom(rid);
    if (!data) {
      setRoomStatus('error');
      return;
    }
    onRemoteState(roomDataToGameState(data, data.st || false, data.fi || false));
    setRoomStatus('synced');
  }, [onRemoteState]);

  // Push state lên server
  const pushState = useCallback(async () => {
    if (!roomId) return;
    try {
      await updateRoomState(roomId, latestRef.current);
      setRemoteVersion(v => v + 1);
    } catch { /* ignore */ }
  }, [roomId]);

  // Subscribe realtime
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeRoom(roomId, async () => {
      const data = await getRoom(roomId);
      if (data) {
        onRemoteState(roomDataToGameState(data, data.st || false, data.fi || false));
        setRemoteVersion(v => v + 1);
      }
    });
    return unsub;
  }, [roomId, onRemoteState]);

  // Copy link
  const copyLink = useCallback(() => {
    if (!roomId) return;
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`).catch(() => {});
  }, [roomId]);

  // Rời phòng
  const leave = useCallback(() => {
    setRoomId(null);
    setRoomStatus('none');
    window.history.pushState({}, '', '/');
  }, []);

  return { roomId, roomStatus, remoteVersion, create, join, pushState, copyLink, leave };
};
