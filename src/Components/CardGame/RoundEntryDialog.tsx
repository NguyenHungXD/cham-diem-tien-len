import { useEffect, useState } from 'react';
import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';
import { RANK_POINTS } from '../../Types/CardGame';
import { Dialog } from '../Dialogs/Dialog';

const RANK_LABELS = ['Nhất', 'Nhì', 'Ba', 'Bét'];

const Row = twc.div`flex flex-row items-center gap-2 py-2 border-b border-white/10`;

const ColorDot = twc.div`w-5 h-5 rounded-full shrink-0`;

const Name = twc.div`flex-1 text-text-primary font-medium truncate`;

const RankButton = twc.button`px-2 py-1 rounded-md text-xs font-semibold min-w-[40px]`;

const BonusInput = twc.input`bg-secondary-main text-text-primary rounded-md px-2 py-1 outline-none border-none w-16 text-center`;

const ConfirmButton = twc.button`mt-4 w-full bg-primary-main hover:bg-primary-dark text-text-primary font-bold px-4 py-2 rounded-md duration-200 disabled:opacity-50`;

export const RoundEntryDialog = ({
  dialogRef,
}: {
  dialogRef: React.MutableRefObject<HTMLDialogElement | null>;
}) => {
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

  // rank[playerIndex] = 0..3 (Nhất..Bét) hoặc null nếu chưa chọn
  const [ranks, setRanks] = useState<Record<number, number | null>>(emptyRanks);
  const [bonus, setBonus] = useState<Record<number, number>>(emptyBonus);

  // Dọn form sau khi dialog đóng để lần mở sau luôn sạch
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const onClose = () => {
      setRanks(emptyRanks());
      setBonus(emptyBonus());
    };
    node.addEventListener('close', onClose);
    return () => node.removeEventListener('close', onClose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogRef]);

  const assignRank = (playerIndex: number, rank: number) => {
    setRanks((prev) => {
      const next = { ...prev };
      // Nếu rank này đang được người khác giữ, bỏ của người đó
      for (const key of Object.keys(next)) {
        const idx = Number(key);
        if (next[idx] === rank) {
          next[idx] = null;
        }
      }
      // Toggle: nếu người này đã giữ rank đó thì bỏ chọn
      next[playerIndex] = prev[playerIndex] === rank ? null : rank;
      return next;
    });
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
    for (const p of state.players) {
      scores[p.index] = previewScore(p.index);
    }
    addRound(scores);
    dialogRef.current?.close();
  };

  return (
    <Dialog id="round-entry" title="Nhập ván mới" dialogRef={dialogRef}>
      <div className="flex flex-col min-w-[300px]">
        <div className="flex flex-row text-xs text-text-secondary pb-1">
          <span className="flex-1">Người chơi</span>
          <span className="w-[180px] text-center">Hạng</span>
          <span className="w-16 text-center">Thưởng</span>
          <span className="w-12 text-right">Điểm</span>
        </div>

        {state.players.map((player) => (
          <Row key={player.index}>
            <ColorDot style={{ backgroundColor: player.color }} />
            <Name>{player.name}</Name>

            <div className="flex flex-row gap-1 w-[180px] justify-center">
              {RANK_LABELS.map((label, rank) => {
                const selected = ranks[player.index] === rank;
                return (
                  <RankButton
                    key={rank}
                    onClick={() => assignRank(player.index, rank)}
                    style={{
                      backgroundColor: selected ? player.color : '#5D7965',
                      opacity: selected ? 1 : 0.6,
                    }}
                  >
                    {label}
                  </RankButton>
                );
              })}
            </div>

            <BonusInput
              type="number"
              value={bonus[player.index] ?? 0}
              onChange={(e) =>
                setBonus((prev) => ({
                  ...prev,
                  [player.index]: Number(e.target.value) || 0,
                }))
              }
            />

            <span className="w-12 text-right font-bold text-text-primary">
              {previewScore(player.index)}
            </span>
          </Row>
        ))}

        <ConfirmButton onClick={handleConfirm} disabled={!allRanksAssigned}>
          {allRanksAssigned ? 'Lưu ván' : 'Chọn đủ thứ hạng cho 4 người'}
        </ConfirmButton>
      </div>
    </Dialog>
  );
};
