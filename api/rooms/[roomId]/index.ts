import { supabase } from '../../lib/supabase';

export const config = {
  runtime: "nodejs",
};

// GET /api/rooms/:roomId
export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const roomId = parts[parts.length - 1];

    const { data: row, error: fetchError } = await supabase
      .from('rooms')
      .select('data')
      .eq('id', roomId)
      .single();

    if (fetchError || !row) {
      return new Response(JSON.stringify({ error: 'Room not found or expired', expired: true }), { status: 404 });
    }

    return new Response(JSON.stringify(row.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
};
