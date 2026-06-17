export const config = {
  runtime: "nodejs",
};

// PUT /api/rooms/:roomId/state
export default async (req: Request) => {
  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const roomId = parts[parts.length - 2];
    const body = await req.json();
    const { playerToken, version, state } = body;
    if (!playerToken || version === undefined || !state) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const { kv } = await import('@vercel/kv');

    const raw = await kv.get(`room:${roomId}`);
    if (!raw) {
      return new Response(JSON.stringify({ error: 'Room not found or expired', expired: true }), { status: 404 });
    }

    const roomData = JSON.parse(raw);
    const player = roomData.players.find((p: { token: string }) => p.token === playerToken);
    if (!player) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 403 });
    }

    if (roomData.version > version) {
      return new Response(JSON.stringify({ error: 'Version conflict', currentVersion: roomData.version }), { status: 409 });
    }

    roomData.version++;
    roomData.rounds = state.rounds;
    roomData.started = state.started;
    roomData.finished = state.finished;
    roomData.mode = state.mode;
    roomData.maxScore = state.maxScore;
    roomData.totalRounds = state.totalRounds;

    await kv.set(`room:${roomId}`, JSON.stringify(roomData), { ex: 43200 });

    return new Response(JSON.stringify({ version: roomData.version }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
};
