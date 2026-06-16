import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';

const Wrapper = twc.div`flex flex-col w-full mt-2 glass rounded-2xl p-3`;

const Title = twc.div`text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 px-1`;

export const HistoryList = () => {
  const { state, deleteRound } = useCardGame();

  if (state.rounds.length === 0) {
    return (
      <Wrapper>
        <Title>Lịch sử các ván</Title>
        <p className="text-sm text-text-secondary text-center py-3">
          Chưa có ván nào. Bấm "Nhập ván mới" để bắt đầu.
        </p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Title>Lịch sử các ván ({state.rounds.length})</Title>

      <div className="flex flex-row items-center gap-2 px-1 pb-1.5">
        <span className="w-7 text-xs text-text-secondary shrink-0">Ván</span>
        {state.players.map((p) => (
          <span
            key={p.index}
            className="flex-1 flex items-center justify-center text-base"
            title={p.name}
          >
            {p.emoji}
          </span>
        ))}
        <span className="w-6 shrink-0" />
      </div>

      <div className="flex flex-col">
        {state.rounds.map((round, i) => (
          <div
            key={round.id}
            className="flex flex-row items-center gap-2 px-1 py-1.5 border-t border-white/5"
          >
            <span className="w-7 text-sm font-semibold text-text-secondary shrink-0">
              {i + 1}
            </span>
            {state.players.map((p) => {
              const v = round.scores[p.index] ?? 0;
              return (
                <span
                  key={p.index}
                  className="flex-1 text-center font-semibold tabular-nums"
                  style={{ color: v < 0 ? 'var(--color-danger)' : undefined }}
                >
                  {v > 0 ? '+' : ''}
                  {v}
                </span>
              );
            })}
            <button
              onClick={() => deleteRound(round.id)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-danger active:bg-white/10 shrink-0"
              aria-label={`Xóa ván ${i + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </Wrapper>
  );
};
