export type RoomApiData = {
  id: string;
  createdAt: number;
  version: number;
  players: { index: number; name: string; color: string; emoji: string }[];
  rounds: { id: string; scores: Record<string, number> }[];
  mode: string;
  maxScore: number;
  totalRounds: number;
  started: boolean;
  finished: boolean;
};

const BASE = '/api';

export const createRoom = async (playerName: string, playerEmoji: string, playerColor: string) => {
  const res = await fetch(`${BASE}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, playerEmoji, playerColor }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ roomId: string; playerToken: string }>;
};

export const joinRoom = async (
  roomId: string,
  playerName: string,
  playerEmoji: string,
  playerColor: string
) => {
  const res = await fetch(`${BASE}/rooms/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, playerEmoji, playerColor }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ playerToken: string; playerIndex: number }>;
};

export const getRoomState = async (roomId: string) => {
  const res = await fetch(`${BASE}/rooms/${roomId}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { status: res.status, ...body } as { status: number; expired?: boolean; error?: string };
  }
  return res.json() as Promise<RoomApiData>;
};

export const updateRoomState = async (
  roomId: string,
  playerToken: string,
  version: number,
  state: {
    rounds: { id: string; scores: Record<number, number> }[];
    started: boolean;
    finished: boolean;
    mode: string;
    maxScore: number;
    totalRounds: number;
  }
) => {
  const res = await fetch(`${BASE}/rooms/${roomId}/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerToken, version, state }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { status: res.status, ...body } as { status: number; expired?: boolean; currentVersion?: number; error?: string };
  }
  return res.json() as Promise<{ version: number }>;
};
