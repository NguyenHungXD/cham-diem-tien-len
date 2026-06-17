import { supabase } from '../../lib/supabase';

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

    const { data: row, error: fetchError } = await supabase
      .from('rooms')
      .select('data')
      .eq('id', roomId)
      .single();

    if (fetchError || !row) {
      return new Response(JSON.stringify({ error: 'Room not found or expired', expired: true }), { status: 404 });
    }

    const roomData = row.data;
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

    const { error: updateError } = await supabase
      .from('rooms')
      .update({ data: roomData })
      .eq('id', roomId);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }

    return new Response(JSON.stringify({ version: roomData.version }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
};
