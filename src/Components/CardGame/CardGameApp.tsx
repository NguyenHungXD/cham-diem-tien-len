import { useCardGame } from '../../Hooks/useCardGame';
import { SetupScreen } from './SetupScreen';
import { Scoreboard } from './Scoreboard';
import { MatchOver } from './MatchOver';

export const CardGameApp = () => {
  const { state } = useCardGame();

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
