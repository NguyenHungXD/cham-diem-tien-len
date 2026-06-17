import { useEffect } from 'react';
import { useCardGame } from '../../Hooks/useCardGame';
import { SetupScreen } from './SetupScreen';
import { Scoreboard } from './Scoreboard';
import { MatchOver } from './MatchOver';

export const CardGameApp = () => {
  const { state, addRound } = useCardGame();

  // Phát hiện game state từ URL khi tải trang
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('game');
    if (!encoded) return;
    try {
      const data = JSON.parse(atob(encoded));
      if (data.r && Array.isArray(data.r)) {
        // Import state từ link: thêm các ván từ link vào state hiện tại (từ localStorage)
        for (const round of data.r) {
          addRound(round.scores);
        }
        // Xóa param khỏi URL để không import lại khi refresh
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // ignore invalid encoded data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.started) {
    return <SetupScreen />;
  }

  return (
    <div className="relative min-h-[100dvh] w-full pb-28">
      <Scoreboard />
      {state.finished && <MatchOver />}
    </div>
  );
};
