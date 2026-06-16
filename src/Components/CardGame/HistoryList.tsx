import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';

const Wrapper = twc.div`flex flex-col w-full mt-2`;

const Title = twc.div`text-sm text-text-secondary mb-1`;

const HeaderRow = twc.div`flex flex-row items-center gap-2 text-xs text-text-secondary px-2`;

const RoundRow = twc.div`flex flex-row items-center gap-2 px-2 py-1 border-b border-white/5`;

const Cell = twc.div`flex-1 text-center text-text-primary tabular-nums`;

const DeleteButton = twc.button`text-red-400 hover:text-red-300 text-sm px-1 shrink-0`;

export const HistoryList = () => {
  const { state, deleteRound } = useCardGame();

  if (state.rounds.length === 0) {
    return null;
  }

  return (
    <Wrapper>
      <Title>Lịch sử các ván ({state.rounds.length})</Title>

      <HeaderRow>
        <span className="w-8 text-left">Ván</span>
        {state.players.map((p) => (
          <span key={p.index} className="flex-1 text-center truncate">
            {p.name}
          </span>
        ))}
        <span className="w-6" />
      </HeaderRow>

      {state.rounds.map((round, i) => (
        <RoundRow key={round.id}>
          <span className="w-8 text-left text-text-secondary">{i + 1}</span>
          {state.players.map((p) => (
            <Cell key={p.index}>{round.scores[p.index] ?? 0}</Cell>
          ))}
          <DeleteButton
            onClick={() => deleteRound(round.id)}
            aria-label={`Xóa ván ${i + 1}`}
          >
            ✕
          </DeleteButton>
        </RoundRow>
      ))}
    </Wrapper>
  );
};
