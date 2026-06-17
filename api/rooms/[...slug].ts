import { customAlphabet } from 'nanoid';

export const config = { runtime: "nodejs" };

interface PlayerData { index: number; name: string; color: string; emoji: string; token: string; }
interface RoomData { id: string; createdAt: number; version: number; players: PlayerData[]; rounds: { id: string; scores: Record<number, number> }[]; mode: string; maxScore: number; totalRounds: number; started: boolean; finished: boolean; }

const rooms = new Map<string, RoomData>();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

// POST  /api/rooms          → tạo phòng
// GET   /api/rooms/:roomId  → lấy state
// POST  /api/rooms/:roomId/join  → tham gia
// PUT   /api/rooms/:roomId/state → cập nhật
export default async (req: Request) => {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  // parts = ['api', 'rooms', ...slug]

  try {
    // POST /api/rooms (không có slug)
    if (parts.length === 2 && req.method === 'POST') {
      const body = await req.json();
      const { playerName, playerEmoji, playerColor } = body;
      if (!playerName || !playerEmoji || !playerColor) return json({ error: 'Missing fields' }, 400);

      const nid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
      const roomId = nid();
      const playerToken = 'tok_' + customAlphabet('0123456789abcdef', 16)();

      rooms.set(roomId, {
        id: roomId, createdAt: Date.now(), version: 1,
        players: [{ index: 0, name: playerName, color: playerColor, emoji: playerEmoji, token: playerToken }],
        rounds: [], mode: 'score', maxScore: 50, totalRounds: 10,
        started: false, finished: false,
      });
      setTimeout(() => rooms.delete(roomId), 12 * 60 * 60 * 1000);
      return json({ roomId, playerToken });
    }

    // Cần có slug (roomId) cho các route còn lại
    if (parts.length < 3) return json({ error: 'Not found' }, 404);

    const roomId = parts[2];
    const action = parts[3] || '';

    // GET /api/rooms/:roomId
    if (!action && req.method === 'GET') {
      const data = rooms.get(roomId);
      if (!data) return json({ error: 'Room not found', expired: true }, 404);
      return json(data);
    }

    const roomData = rooms.get(roomId);
    if (!roomData) return json({ error: 'Room not found', expired: true }, 404);

    // POST /api/rooms/:roomId/join
    if (action === 'join' && req.method === 'POST') {
      const body = await req.json();
      const { playerName, playerEmoji, playerColor } = body;
      if (!playerName || !playerEmoji || !playerColor) return json({ error: 'Missing fields' }, 400);
      if (roomData.players.length >= 4) return json({ error: 'Room is full' }, 400);

      const playerToken = 'tok_' + customAlphabet('0123456789abcdef', 16)();
      const nextIndex = roomData.players.length;
      roomData.players.push({ index: nextIndex, name: playerName, color: playerColor, emoji: playerEmoji, token: playerToken });
      roomData.version++;
      return json({ playerToken, playerIndex: nextIndex });
    }

    // PUT /api/rooms/:roomId/state
    if (action === 'state' && req.method === 'PUT') {
      const body = await req.json();
      const { playerToken, version, state } = body;
      if (!playerToken || version === undefined || !state) return json({ error: 'Missing fields' }, 400);
      if (!roomData.players.find((p: PlayerData) => p.token === playerToken)) return json({ error: 'Invalid token' }, 403);
      if (roomData.version > version) return json({ error: 'Version conflict', currentVersion: roomData.version }, 409);

      roomData.version++;
      roomData.rounds = state.rounds;
      roomData.started = state.started;
      roomData.finished = state.finished;
      roomData.mode = state.mode;
      roomData.maxScore = state.maxScore;
      roomData.totalRounds = state.totalRounds;
      return json({ version: roomData.version });
    }

    return json({ error: 'Not found' }, 404);
  } catch (err) {
    console.error('api error:', err);
    return json({ error: 'Internal error' }, 500);
  }
};
