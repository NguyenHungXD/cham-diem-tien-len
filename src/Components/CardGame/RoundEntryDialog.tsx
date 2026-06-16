import { useState } from 'react';
import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';
import { RANK_POINTS } from '../../Types/CardGame';

const RANK_LABELS = ['Nhất', 'Nhì', 'Ba', 'Bét'];
const RANK_MEDALS = ['🥇', '🥈', '🥉', '💩'];

const Overlay = twc.div`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm animate-pop-in`;

const Sheet = twc.div`w-full sm:max-w-md bg-[#161827] rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92dvh]`;

// Mount/unmount bởi parent — state khởi tạo lại tự nhiên mỗi lần mở
export const RoundEntryDialog = ({ onClose }: { onClose: () => void }) => {
  const { state, addRound } = useCardGame();

  // Số hạng cần chọn tay = số người - 1 (người cuối tự động là Bét)
  const ranksToPick = state.players.length - 1;

  const emptyRanks = () => {
    const r: Record<number, number | null> = {};
    for (const p of state.players) r[p.index] = null;
    return r;
  };
  const emptyBonus = () => {
    const b: Record<number, number> = {};
    for (const p of state.players) b[p.index] = 0;
    return b;
  };

  const [ranks, setRanks] = useState<Record<number, number | null>>(emptyRanks);
  const [bonus, setBonus] = useState<Record<number, number>>(emptyBonus);

  const assignedCount = state.players.filter(
    (p) => ranks[p.index] !== null && ranks[p.index] !== undefined
  ).length;

  // Đã chọn đủ Nhất/Nhì/Ba → người còn lại tự thành Bét
  const ready = assignedCount === ranksToPick;

  // Hạng tiếp theo cần gán (chỉ tới Ba, không gán Bét bằng tay)
  const nextRankToAssign = (() => {
    const used = new Set(
      state.players
        .map((p) => ranks[p.index])
        .filter((r): r is number => r !== null && r !== undefined)
    );
    for (let r = 0; r < ranksToPick; r++) {
      if (!used.has(r)) return r;
    }
    return null;
  })();

  // Hạng hiệu lực: hạng đã gán, hoặc Bét nếu là người duy nhất chưa gán khi đã đủ
  const effectiveRank = (playerIndex: number): number | null => {
    const r = ranks[playerIndex];
    if (r !== null && r !== undefined) return r;
    if (ready) return state.players.length - 1; // Bét
    return null;
  };

  const tapPlayer = (playerIndex: number) => {
    setRanks((prev) => {
      const next = { ...prev };
      if (next[playerIndex] !== null && next[playerIndex] !== undefined) {
        // Đã có hạng → bỏ chọn
        next[playerIndex] = null;
        return next;
      }
      // Gán hạng trống thấp nhất (chỉ Nhất/Nhì/Ba)
      const used = new Set(
        Object.values(next).filter(
          (r): r is number => r !== null && r !== undefined
        )
      );
      for (let r = 0; r < ranksToPick; r++) {
        if (!used.has(r)) {
          next[playerIndex] = r;
          break;
        }
      }
      return next;
    });
  };

  const adjustBonus = (playerIndex: number, delta: number) => {
    setBonus((prev) => ({
      ...prev,
      [playerIndex]: (prev[playerIndex] || 0) + delta,
    }));
  };

  const setBonusValue = (playerIndex: number, value: number) => {
    setBonus((prev) => ({ ...prev, [playerIndex]: value }));
  };

  const previewScore = (playerIndex: number) => {
    const rank = effectiveRank(playerIndex);
    const base = rank !== null ? RANK_POINTS[rank] : 0;
    return base + (bonus[playerIndex] || 0);
  };

  const handleConfirm = () => {
    if (!ready) return;
    const scores: Record<number, number> = {};
    for (const p of state.players) scores[p.index] = previewScore(p.index);
    addRound(scores);
    onClose();
  };

  return (
    <Overlay onClick={() => onClose()}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <h2 className="text-xl font-extrabold">Nhập ván mới</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {nextRankToAssign !== null
                ? `Bấm người về ${RANK_LABELS[nextRankToAssign]}`
                : 'Người còn lại là Bét · chỉnh điểm thưởng nếu cần'}
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
          {state.players.map((player) => {
            const rank = effectiveRank(player.index);
            const hasRank = rank !== null;
            const isAutoBet =
              hasRank &&
              (ranks[player.index] === null || ranks[player.index] === undefined);
            return (
              <div
                key={player.index}
                className="rounded-2xl p-3 border duration-150"
                style={{
                  borderColor: hasRank ? player.color : 'rgba(255,255,255,0.08)',
                  background: hasRank
                    ? `linear-gradient(135deg, ${player.color}22, rgba(255,255,255,0.03))`
                    : 'rgba(255,255,255,0.03)',
                }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => tapPlayer(player.index)}
                    className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl shrink-0 active:scale-90 duration-150 relative"
                    style={{ backgroundColor: player.color }}
                    aria-label={`Gán hạng cho ${player.name}`}
                  >
                    {player.emoji}
                    {hasRank && (
                      <span className="absolute -top-1.5 -right-1.5 text-lg drop-shadow">
                        {RANK_MEDALS[rank]}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => tapPlayer(player.index)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="font-bold truncate">{player.name}</div>
                    <div className="text-xs text-text-secondary">
                      {hasRank
                        ? `${RANK_LABELS[rank]}${isAutoBet ? ' (tự động)' : ''} · cơ bản +${RANK_POINTS[rank]}`
                        : 'Chưa xếp hạng'}
                    </div>
                  </button>

                  <div
                    className="text-2xl font-extrabold tabular-nums shrink-0 w-10 text-right"
                    style={{ color: hasRank ? player.color : 'var(--color-text-secondary)' }}
                  >
                    {hasRank ? previewScore(player.index) : '–'}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 pl-1">
                  <span className="text-xs text-text-secondary">
                    Thưởng (chặt/đốt/cháy)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustBonus(player.index, -1)}
                      className="w-8 h-8 rounded-full bg-white/8 text-lg font-bold active:scale-90 flex items-center justify-center"
                      aria-label="Giảm điểm thưởng"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={bonus[player.index] || 0}
                      onChange={(e) =>
                        setBonusValue(player.index, Math.trunc(Number(e.target.value) || 0))
                      }
                      onFocus={(e) => e.target.select()}
                      className="w-16 text-center font-bold tabular-nums bg-white/8 rounded-lg py-1 outline-none border-none text-text-primary"
                    />
                    <button
                      onClick={() => adjustBonus(player.index, 1)}
                      className="w-8 h-8 rounded-full bg-white/8 text-lg font-bold active:scale-90 flex items-center justify-center"
                      aria-label="Tăng điểm thưởng"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <button
            onClick={handleConfirm}
            disabled={!ready}
            className="w-full bg-primary-main active:scale-[0.98] text-white font-bold px-4 py-4 rounded-2xl duration-150 disabled:opacity-40 disabled:active:scale-100 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]"
          >
            {ready ? '✓ Lưu ván' : `Bấm người về ${RANK_LABELS[nextRankToAssign ?? 0]}`}
          </button>
        </div>
      </Sheet>
    </Overlay>
  );
};
