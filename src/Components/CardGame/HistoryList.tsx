import { useState } from 'react';
import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';
import { EditRoundDialog } from './EditRoundDialog';

const Wrapper = twc.div`flex flex-col w-full mt-2 glass rounded-2xl p-3`;

const Title = twc.div`text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 px-1`;

export const HistoryList = () => {
  const { state } = useCardGame();
  const [editing, setEditing] = useState<{ id: string; number: number } | null>(
    null
  );

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

  // Tổng cộng dồn để hiển thị ở hàng cuối
  const totals: Record<number, number> = {};
  for (const p of state.players) {
    totals[p.index] = state.rounds.reduce(
      (s, r) => s + (r.scores[p.index] ?? 0),
      0
    );
  }

  return (
    <Wrapper>
      <Title>Lịch sử các ván ({state.rounds.length}) · bấm để sửa</Title>

      <div className="flex flex-row items-center gap-2 px-1 pb-1.5">
        <span className="w-7 text-xs text-text-secondary shrink-0">Ván</span>
        {state.players.map((p) => (
          <span
            key={p.index}
            className="flex-1 flex flex-col items-center justify-center min-w-0"
            title={p.name}
          >
            <span className="text-base leading-none">{p.emoji}</span>
            <span
              className="text-[10px] leading-tight font-semibold truncate max-w-full mt-0.5"
              style={{ color: p.color }}
            >
              {p.name}
            </span>
          </span>
        ))}
      </div>

      <div className="flex flex-col">
        {state.rounds.map((round, i) => (
          <button
            key={round.id}
            onClick={() => setEditing({ id: round.id, number: i + 1 })}
            className="flex flex-row items-center gap-2 px-1 py-1.5 border-t border-white/5 active:bg-white/5 rounded-lg duration-150 text-left"
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
          </button>
        ))}

        {/* Hàng tổng cộng dồn */}
        <div className="flex flex-row items-center gap-2 px-1 py-2 border-t-2 border-white/10 mt-0.5">
          <span className="w-7 text-xs font-bold text-text-secondary shrink-0">
            Σ
          </span>
          {state.players.map((p) => (
            <span
              key={p.index}
              className="flex-1 text-center font-extrabold tabular-nums"
              style={{
                color:
                  totals[p.index] < 0 ? 'var(--color-danger)' : p.color,
              }}
            >
              {totals[p.index]}
            </span>
          ))}
        </div>
      </div>

      {editing && (
        <EditRoundDialog
          roundId={editing.id}
          roundNumber={editing.number}
          onClose={() => setEditing(null)}
        />
      )}
    </Wrapper>
  );
};
