import { useMemo } from 'react';
import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';

const Wrapper = twc.div`flex flex-col items-center w-full min-h-[100dvh] px-4 pt-24 pb-12 gap-6 max-w-md mx-auto`;
const Title = twc.h1`text-2xl font-extrabold text-center`;
const Card = twc.div`glass w-full flex flex-col gap-4 rounded-3xl p-4`;
const SectionLabel = twc.div`text-xs font-bold uppercase tracking-wider text-text-secondary px-1`;
const StartButton = twc.button`mt-2 w-full bg-primary-main active:scale-[0.98] text-white font-bold text-lg px-6 py-4 rounded-2xl duration-150 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]`;

export const JoinRoomScreen = () => {
  const routeMatch = useMemo(() => window.location.pathname.match(/\/room\/([A-Za-z0-9]+)/)?.[1] || '', []);
  const { roomId, joinRoom } = useCardGame();
  const roomIdFromUrl = roomId || routeMatch;

  const handleJoin = () => {
    if (roomIdFromUrl) joinRoom(roomIdFromUrl);
  };

  return (
    <Wrapper>
      <div className="text-5xl mb-2">🃏</div>
      <Title>Tham gia phòng</Title>
      <p className="text-sm text-text-secondary text-center">Mã phòng: <span className="font-bold text-primary-main">{roomIdFromUrl}</span></p>
      <Card>
        <SectionLabel>Bạn sắp tham gia phòng chơi</SectionLabel>
        <p className="text-sm text-text-secondary">Dữ liệu phòng sẽ được tải từ server. Các thay đổi sẽ đồng bộ real-time với mọi người.</p>
      </Card>
      <StartButton onClick={handleJoin}>Tham gia phòng 🎮</StartButton>
    </Wrapper>
  );
};
