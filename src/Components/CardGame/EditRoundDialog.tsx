import { useState } from 'react';
import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';

const Overlay = twc.div`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm animate-pop-in`;

const Sheet = twc.div`w-full sm:max-w-md bg-[#161827] rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92dvh]`;

export const EditRoundDialog = ({
  roundId,
  roundNumber,
  onClose,
}: {
  roundId: string;
  roundNumber: number;
  onClose: () => void;
}) => {
  const { state, editRound, deleteRound } = useCardGame();
  const round = state.rounds.find((r) => r.id === roundId);

  // Chuỗi nháp cho từng ô, khởi tạo từ điểm hiện tại
  const [text, setText] = useState<Record<number, string>>(() => {
    const t: Record<number, string> = {};
    for (const p of state.players) t[p.index] = String(round?.scores[p.index] ?? 0);
    return t;
  });

  if (!round) return null;

  const parse = (raw: string) => {
    if (raw === '' || raw === '-') return 0;
    const n = Math.trunc(Number(raw));
    return Number.isNaN(n) ? 0 : n;
  };

  const adjust = (playerIndex: number, delta: number) => {
    setText((t) => ({
      ...t,
      [playerIndex]: String(parse(t[playerIndex] ?? '0') + delta),
    }));
  };

  const handleSave = () => {
    const scores: Record<number, number> = {};
    for (const p of state.players) scores[p.index] = parse(text[p.index] ?? '0');
    editRound(roundId, scores);
    onClose();
  };

  const handleDelete = () => {
    deleteRound(roundId);
    onClose();
  };

  return (
    <Overlay onClick={() => onClose()}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <h2 className="text-xl font-extrabold">Sửa ván {roundNumber}</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Chỉnh điểm từng người (cho phép số âm)
            </p>
          </div>
          <button
            onClick={() => onClose()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/8 text-text-secondary text-lg active:scale-90"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2.5 px-5 py-3 overflow-auto">
          {state.players.map((player) => (
            <div
              key={player.index}
              className="flex items-center gap-3 rounded-2xl p-3 border"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: `linear-gradient(135deg, ${player.color}1a, rgba(255,255,255,0.03))`,
              }}
            >
              <span
                className="flex items-center justify-center w-11 h-11 rounded-2xl text-xl shrink-0"
                style={{ backgroundColor: player.color }}
              >
                {player.emoji}
              </span>
              <span className="flex-1 font-bold truncate">{player.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => adjust(player.index, -1)}
                  className="w-8 h-8 rounded-full bg-white/8 text-lg font-bold active:scale-90 flex items-center justify-center"
                  aria-label="Giảm"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="-?[0-9]*"
                  value={text[player.index] ?? '0'}
                  onChange={(e) =>
                    setText((t) => ({ ...t, [player.index]: e.target.value }))
                  }
                  onFocus={(e) => e.target.select()}
                  className="w-16 text-center font-bold tabular-nums bg-white/8 rounded-lg py-1.5 outline-none border-none text-text-primary"
                />
                <button
                  onClick={() => adjust(player.index, 1)}
                  className="w-8 h-8 rounded-full bg-white/8 text-lg font-bold active:scale-90 flex items-center justify-center"
                  aria-label="Tăng"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 px-5 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <button
            onClick={handleDelete}
            className="flex-1 bg-white/8 text-danger font-bold px-4 py-3.5 rounded-2xl duration-150 active:scale-[0.98]"
          >
            🗑 Xóa ván
          </button>
          <button
            onClick={handleSave}
            className="flex-[1.6] bg-primary-main text-white font-bold px-4 py-3.5 rounded-2xl duration-150 active:scale-[0.98] shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]"
          >
            ✓ Lưu thay đổi
          </button>
        </div>
      </Sheet>
    </Overlay>
  );
};
