import { customAlphabet } from 'nanoid';

export const config = {
  runtime: "nodejs",
};

interface PlayerData { index: number; name: string; color: string; emoji: string; token: string; }
interface RoomData { id: string; createdAt: number; version: number; players: PlayerData[]; rounds: { id: string; scores: Record<number, number> }[]; mode: string; maxScore: number; totalRounds: number; started: boolean; finished: boolean; }

const rooms = new Map<string, RoomData>();

function getBody(req: Request) { return req.json(); }

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleCreate(req: Request) {
  const body = await getBody(req);
  const { playerName, playerEmoji, playerColor } = body;
  if (!playerName || !playerEmoji || !playerColor) return json({ error: 'Missing fields' }, 400);

  const nanoid6 = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
  const roomId = nanoid6();
  const playerToken = 'tok_' + customAlphabet('0123456789abcdef', 16)();

  rooms.set(roomId, {
    id: roomId,
    createdAt: Date.now(),
    version: 1,
    players: [{ index: 0, name: playerName, color: playerColor, emoji: playerEmoji, token: playerToken }],
    rounds: [],
    mode: 'score', maxScore: 50, totalRounds: 10,
    started: false, finished: false,
  });

  setTimeout(() => rooms.delete(roomId), 12 * 60 * 60 * 1000);
  return json({ roomId, playerToken });
}

async function handleGet(roomId: string) {
  const data = rooms.get(roomId);
  if (!data) return json({ error: 'Room not found', expired: true }, 404);
  return json(data);
}

async function handleJoin(roomId: string, req: Request) {
  const body = await getBody(req);
  const { playerName, playerEmoji, playerColor } = body;
  if (!playerName || !playerEmoji || !playerColor) return json({ error: 'Missing fields' }, 400);

  const roomData = rooms.get(roomId);
  if (!roomData) return json({ error: 'Room not found', expired: true }, 404);
  if (roomData.players.length >= 4) return json({ error: 'Room is full' }, 400);

  const playerToken = 'tok_' + customAlphabet('0123456789abcdef', 16)();
  const nextIndex = roomData.players.length;
  roomData.players.push({ index: nextIndex, name: playerName, color: playerColor, emoji: playerEmoji, token: playerToken });
  roomData.version++;
  rooms.set(roomId, roomData);

  return json({ playerToken, playerIndex: nextIndex });
}

async function handleState(roomId: string, req: Request) {
  const body = await getBody(req);
  const { playerToken, version, state } = body;
  if (!playerToken || version === undefined || !state) return json({ error: 'Missing fields' }, 400);

  const roomData = rooms.get(roomId);
  if (!roomData) return json({ error: 'Room not found', expired: true }, 404);
  if (!roomData.players.find((p: PlayerData) => p.token === playerToken)) return json({ error: 'Invalid token' }, 403);
  if (roomData.version > version) return json({ error: 'Version conflict', currentVersion: roomData.version }, 409);

  roomData.version++;
  Object.assign(roomData, {
    rounds: state.rounds, started: state.started, finished: state.finished,
    mode: state.mode, maxScore: state.maxScore, totalRounds: state.totalRounds,
  });
  rooms.set(roomId, roomData);

  return json({ version: roomData.version });
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts.length === 2 && parts[1] === 'rooms') {
    if (req.method === 'POST') return handleCreate(req);
    return json({ error: 'Method not allowed' }, 405);
  }

  if (parts.length >= 3 && parts[1] === 'rooms') {
    const roomId = parts[2];
    const action = parts[3] || '';
    if (!action && req.method === 'GET') return handleGet(roomId);
    if (action === 'join' && req.method === 'POST') return handleJoin(roomId, req);
    if (action === 'state' && req.method === 'PUT') return handleState(roomId, req);
  }

  return json({ error: 'Not found' }, 404);
};
