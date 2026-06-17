export const config = {
  runtime: "nodejs",
};

interface RoomData {
  id: string;
  createdAt: number;
  version: number;
  players: { index: number; name: string; color: string; emoji: string; token: string }[];
  rounds: { id: string; scores: Record<number, number> }[];
  mode: string;
  maxScore: number;
  totalRounds: number;
  started: boolean;
  finished: boolean;
}

// POST /api/rooms
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { playerName, playerEmoji, playerColor } = body;
    if (!playerName || !playerEmoji || !playerColor) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const { customAlphabet } = await import('nanoid');
    const { kv } = await import('@vercel/kv');

    const nanoid6 = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
    const roomId = nanoid6();
    const playerToken = 'tok_' + customAlphabet('0123456789abcdef', 16)();

    const roomData: RoomData = {
      id: roomId,
      createdAt: Date.now(),
      version: 1,
      players: [{ index: 0, name: playerName, color: playerColor, emoji: playerEmoji, token: playerToken }],
      rounds: [],
      mode: 'score',
      maxScore: 50,
      totalRounds: 10,
      started: false,
      finished: false,
    };

    await kv.set(`room:${roomId}`, JSON.stringify(roomData), { ex: 43200 });

    return new Response(JSON.stringify({ roomId, playerToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create room error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
};
