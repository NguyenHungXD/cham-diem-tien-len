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

  // Hạng tiếp theo cần gán (theo thứ tự bấm)
  const nextRankToAssign = (() => {
    const used = new Set(
      state.players
        .map((p) => ranks[p.index])
        .filter((r): r is number => r !== null && r !== undefined)
    );
    for (let r = 0; r < state.players.length; r++) {
      if (!used.has(r)) return r;
    }
    return null;
  })();

  const tapPlayer = (playerIndex: number) => {
    setRanks((prev) => {
      const next = { ...prev };
      if (next[playerIndex] !== null && next[playerIndex] !== undefined) {
        // Đã có hạng → bỏ chọn
        next[playerIndex] = null;
        return next;
      }
      // Gán hạng trống thấp nhất
      const used = new Set(
        Object.values(next).filter(
          (r): r is number => r !== null && r !== undefined
        )
      );
      for (let r = 0; r < state.players.length; r++) {
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

  const allRanksAssigned = state.players.every(
    (p) => ranks[p.index] !== null && ranks[p.index] !== undefined
  );

  const previewScore = (playerIndex: number) => {
    const rank = ranks[playerIndex];
    const base = rank !== null && rank !== undefined ? RANK_POINTS[rank] : 0;
    return base + (bonus[playerIndex] || 0);
  };

  const handleConfirm = () => {
    if (!allRanksAssigned) return;
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
                : 'Đã đủ thứ hạng · chỉnh điểm thưởng nếu cần'}
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
            const rank = ranks[player.index];
            const hasRank = rank !== null && rank !== undefined;
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
                        ? `${RANK_LABELS[rank]} · cơ bản +${RANK_POINTS[rank]}`
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
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold tabular-nums">
                      {bonus[player.index] > 0 ? '+' : ''}
                      {bonus[player.index] || 0}
                    </span>
                    <button
                      onClick={() => adjustBonus(player.index, 1)}
                      className="w-8 h-8 rounded-full bg-white/8 text-lg font-bold active:scale-90 flex items-center justify-center"
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
            disabled={!allRanksAssigned}
            className="w-full bg-primary-main active:scale-[0.98] text-white font-bold px-4 py-4 rounded-2xl duration-150 disabled:opacity-40 disabled:active:scale-100 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]"
          >
            {allRanksAssigned ? '✓ Lưu ván' : `Bấm người về ${RANK_LABELS[nextRankToAssign ?? 0]}`}
          </button>
        </div>
      </Sheet>
    </Overlay>
  );
};
