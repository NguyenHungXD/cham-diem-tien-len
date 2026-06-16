import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';

const Wrapper = twc.div`flex flex-col items-center justify-center min-h-[100dvh] w-full px-4 py-8 gap-6`;

const Title = twc.h1`text-4xl font-bold text-text-primary text-center`;

const Subtitle = twc.p`text-sm text-text-secondary text-center -mt-4`;

const Card = twc.div`w-full max-w-md flex flex-col gap-4 bg-background-default/60 rounded-2xl p-6 shadow-[1px_2px_8px_0px_rgba(0,0,0,0.3)]`;

const PlayerRow = twc.div`flex flex-row items-center gap-3`;

const ColorDot = twc.div`w-6 h-6 rounded-full shrink-0`;

const NameInput = twc.input`flex-1 bg-secondary-main text-text-primary rounded-md px-3 py-2 outline-none border-none`;

const Label = twc.label`text-text-primary font-medium`;

const StartButton = twc.button`mt-2 bg-primary-main hover:bg-primary-dark text-text-primary font-bold text-lg px-6 py-3 rounded-xl duration-200 ease-in-out shadow-[1px_2px_4px_0px_rgba(0,0,0,0.3)] disabled:opacity-50`;

export const SetupScreen = () => {
  const { state, setPlayerName, setMaxScore, startMatch } = useCardGame();

  return (
    <Wrapper>
      <Title>Chấm Điểm Tiến Lên</Title>
      <Subtitle>Nhất +3 · Nhì +2 · Ba +1 · Bét 0</Subtitle>

      <Card>
        <Label>Tên người chơi</Label>
        {state.players.map((player) => (
          <PlayerRow key={player.index}>
            <ColorDot style={{ backgroundColor: player.color }} />
            <NameInput
              value={player.name}
              maxLength={20}
              onChange={(e) => setPlayerName(player.index, e.target.value)}
              placeholder={`Người chơi ${player.index + 1}`}
            />
          </PlayerRow>
        ))}
      </Card>

      <Card>
        <div className="flex flex-row justify-between items-center">
          <Label>Điểm tối đa (về đích)</Label>
          <input
            type="number"
            min={1}
            max={9999}
            value={state.maxScore}
            className="bg-secondary-main text-text-primary rounded-md px-3 py-2 outline-none border-none w-24 text-center font-semibold"
            onChange={(e) => {
              const val = Math.max(1, Math.min(9999, Number(e.target.value) || 1));
              setMaxScore(val);
            }}
          />
        </div>
        <p className="text-xs text-text-secondary">
          Ai đạt mốc điểm này trước sẽ kết thúc trận.
        </p>
      </Card>

      <StartButton onClick={startMatch}>Bắt đầu</StartButton>
    </Wrapper>
  );
};
