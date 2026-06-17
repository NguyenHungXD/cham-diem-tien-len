import { useCardGame } from '../../Hooks/useCardGame';
import { SetupScreen } from './SetupScreen';
import { Scoreboard } from './Scoreboard';
import { MatchOver } from './MatchOver';
import { JoinRoomScreen } from './JoinRoomScreen';
import { RoomExpired } from './RoomExpired';

export const CardGameApp = () => {
  const { state, roomStatus, roomId } = useCardGame();

  // Room mode: show join screen if user has no token
  if (roomId && roomStatus === 'idle') {
    return <JoinRoomScreen roomId={roomId} />;
  }

  if (roomStatus === 'expired') {
    return <RoomExpired />;
  }

  if (!state.started) {
    return <SetupScreen />;
  }

  return (
    <div className="relative min-h-[100dvh] w-full">
      <Scoreboard />
      {state.finished && <MatchOver />}
    </div>
  );
};
