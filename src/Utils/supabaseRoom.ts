import { createClient } from '@supabase/supabase-js';
import { CardGameState } from '../Types/CardGame';

const supabaseUrl = 'https://ugokdtnlfownmashseev.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnb2tkdG5sZm93bm1hc2hzZWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTU2OTAsImV4cCI6MjA5NzI3MTY5MH0.nQTSWuaczYN864qpR8LA2OEVNFtuocgzTDCMYvDzr2c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type RoomData = {
  r: { id: string; s: Record<number, number> }[];
  p: { i: number; n: string; c: string; e: string }[];
  m: string;
  ms: number;
  tr: number;
  st: boolean;
  fi: boolean;
};

export const createRoom = async (
  players: CardGameState['players'],
  mode: CardGameState['mode'],
  maxScore: number,
  totalRounds: number,
): Promise<string> => {
  const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
  const data: RoomData = {
    r: [], p: players.map(p => ({ i: p.index, n: p.name, c: p.color, e: p.emoji })),
    m: mode, ms: maxScore, tr: totalRounds, st: false, fi: false,
  };
  const { error } = await supabase.from('rooms').insert({ id: roomId, data });
  if (error) {
    console.error('createRoom supabase error:', error);
    throw error;
  }
  return roomId;
};

export const getRoom = async (roomId: string): Promise<RoomData | null> => {
  const { data, error } = await supabase.from('rooms').select('data').eq('id', roomId).single();
  if (error || !data) return null;
  return data.data as unknown as RoomData;
};

export const updateRoomState = async (roomId: string, state: CardGameState) => {
  const data: RoomData = {
    r: state.rounds.map(r => ({ id: r.id, s: r.scores })),
    p: state.players.map(p => ({ i: p.index, n: p.name, c: p.color, e: p.emoji })),
    m: state.mode, ms: state.maxScore, tr: state.totalRounds,
    st: state.started, fi: state.finished,
  };
  const { error } = await supabase.from('rooms').update({ data }).eq('id', roomId);
  if (error) throw error;
};

export const roomDataToGameState = (data: RoomData, started: boolean, finished: boolean): CardGameState => ({
  players: data.p.map(p => ({ index: p.i, name: p.n, color: p.c, emoji: p.e })),
  rounds: data.r.map(r => ({ id: r.id, scores: r.s as unknown as Record<number, number> })),
  mode: data.m as CardGameState['mode'],
  maxScore: data.ms,
  totalRounds: data.tr,
  started,
  finished,
});

export const subscribeRoom = (
  roomId: string,
  onChange: () => void,
) => {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      () => onChange(),
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
};
