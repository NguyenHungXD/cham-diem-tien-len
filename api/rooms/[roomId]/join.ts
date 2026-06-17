import { customAlphabet } from 'nanoid';
import { supabase } from '../../lib/supabase';

export const config = {
  runtime: "nodejs",
};

// POST /api/rooms/:roomId/join
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const roomId = parts[parts.length - 2];
    const body = await req.json();
    const { playerName, playerEmoji, playerColor } = body;
    if (!playerName || !playerEmoji || !playerColor) {
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
    if (roomData.players.length >= 4) {
      return new Response(JSON.stringify({ error: 'Room is full (max 4 players)' }), { status: 400 });
    }

    const playerToken = 'tok_' + customAlphabet('0123456789abcdef', 16)();
    const nextIndex = roomData.players.length;
    roomData.players.push({
      index: nextIndex,
      name: playerName,
      color: playerColor,
      emoji: playerEmoji,
      token: playerToken,
    });
    roomData.version++;

    const { error: updateError } = await supabase
      .from('rooms')
      .update({ data: roomData })
      .eq('id', roomId);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }

    return new Response(JSON.stringify({ playerToken, playerIndex: nextIndex }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
};
