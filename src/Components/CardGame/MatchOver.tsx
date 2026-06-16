import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';

const Overlay = twc.div`absolute inset-0 z-20 flex flex-col items-center justify-center bg-background-settings px-4`;

const Card = twc.div`flex flex-col items-center w-full max-w-[500px] bg-background-default rounded-2xl p-6 gap-4`;

const Title = twc.h1`text-2xl font-bold text-text-primary text-center`;

const WinnerName = twc.div`text-3xl font-bold text-icons-gold text-center`;

const Row = twc.div`flex flex-row items-center gap-3 w-full rounded-xl px-4 py-3 border-2`;

const Rank = twc.div`text-xl font-bold text-text-secondary w-7 text-center shrink-0`;

const ColorDot = twc.div`w-6 h-6 rounded-full shrink-0`;

const Name = twc.div`flex-1 text-lg font-medium text-text-primary truncate`;

const Total = twc.div`text-2xl font-bold tabular-nums`;

const NewMatchButton = twc.button`mt-2 w-full bg-primary-main hover:bg-primary-dark text-text-primary font-bold px-4 py-3 rounded-md duration-200`;

export const MatchOver = () => {
  const { state, totals, resetMatch } = useCardGame();

  const ranked = [...state.players].sort(
    (a, b) => totals[b.index] - totals[a.index]
  );
  const winner = ranked[0];

  return (
    <Overlay>
      <Card>
        <Title>🏆 Kết thúc trận</Title>
        <WinnerName>{winner.name} thắng!</WinnerName>

        <div className="flex flex-col gap-2 w-full">
          {ranked.map((player, position) => (
            <Row
              key={player.index}
              style={{
                borderColor:
                  position === 0 ? player.color : 'rgba(255,255,255,0.1)',
                backgroundColor:
                  position === 0
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.03)',
              }}
            >
              <Rank>{position + 1}</Rank>
              <ColorDot style={{ backgroundColor: player.color }} />
              <Name>{player.name}</Name>
              <Total style={{ color: player.color }}>
                {totals[player.index]}
              </Total>
            </Row>
          ))}
        </div>

        <NewMatchButton onClick={resetMatch}>Trận mới</NewMatchButton>
      </Card>
    </Overlay>
  );
};
