import { useCardGame } from '../../Hooks/useCardGame';
import { SetupScreen } from './SetupScreen';
import { Scoreboard } from './Scoreboard';
import { MatchOver } from './MatchOver';
import { JoinRoomScreen } from './JoinRoomScreen';

export const CardGameApp = () => {
  const { state, roomId, roomStatus } = useCardGame();

  // Chưa join phòng nhưng URL có /room/?
  if (roomId && roomStatus === 'creating') return null; // loading
  if (roomId && roomStatus === 'error') {
    return <div className="flex items-center justify-center min-h-screen text-center px-4"><div><div className="text-6xl mb-4">⏰</div><h1 className="text-2xl font-bold text-text-primary mb-2">Không tìm thấy phòng</h1><p className="text-text-secondary mb-6">Mã phòng không tồn tại hoặc đã hết hạn.</p><button onClick={() => window.location.href = '/'} className="bg-primary-main text-white font-bold px-6 py-3 rounded-2xl">Về trang chủ</button></div></div>;
  }
  if (roomId && roomStatus === 'idle') return <JoinRoomScreen />;

  if (!state.started) return <SetupScreen />;

  return (
    <div className="relative min-h-[100dvh] w-full pb-28">
      <Scoreboard />
      {state.finished && <MatchOver />}
    </div>
  );
};
