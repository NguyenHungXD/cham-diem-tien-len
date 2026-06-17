import { useCardGame } from '../../Hooks/useCardGame';
import { Confetti } from './Confetti';

const MEDALS = ['🥇', '🥈', '🥉', ''];

export const MatchOver = () => {
  const { state, totals, resetMatch } = useCardGame();

  const ranked = [...state.players].sort(
    (a, b) => totals[b.index] - totals[a.index]
  );
  const winner = ranked[0];

  // Thống kê: số ván về Nhất, ván điểm cao nhất của mỗi người
  const firstWins: Record<number, number> = {};
  const bestRound: Record<number, number> = {};
  for (const p of state.players) {
    firstWins[p.index] = 0;
    bestRound[p.index] = 0;
  }
  for (const round of state.rounds) {
    // Người về Nhất trong ván = người có điểm cơ bản cao nhất theo RANK_POINTS[0]
    // Suy ra từ điểm: ai có score cao nhất ván đó (xấp xỉ), nhưng chính xác hơn:
    // điểm hạng Nhất là RANK_POINTS[0]. Ta đếm người có điểm ván >= điểm người khác.
    let topIdx = state.players[0].index;
    let topVal = -Infinity;
    for (const p of state.players) {
      const v = round.scores[p.index] ?? 0;
      if (v > topVal) {
        topVal = v;
        topIdx = p.index;
      }
      if (v > bestRound[p.index]) bestRound[p.index] = v;
    }
    firstWins[topIdx] = (firstWins[topIdx] || 0) + 1;
  }

  const topFirstWinner = state.players.reduce((a, b) =>
    firstWins[b.index] > firstWins[a.index] ? b : a
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background-settings backdrop-blur-md px-4 animate-pop-in overflow-auto py-6">
      <Confetti />
      <div className="w-full max-w-md flex flex-col items-center gap-4 bg-[#161827] rounded-3xl p-6 border border-white/10 relative z-10">
        <div className="text-6xl animate-score-bump">🏆</div>
        <div className="text-center">
          <div className="text-sm text-text-secondary font-semibold uppercase tracking-wider">
            Nhà vô địch
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span
              className="flex items-center justify-center w-10 h-10 rounded-2xl text-2xl"
              style={{ backgroundColor: winner.color }}
            >
              {winner.emoji}
            </span>
            <span
              className="text-3xl font-extrabold"
              style={{ color: winner.color }}
            >
              {winner.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full mt-1">
          {ranked.map((player, position) => (
            <div
              key={player.index}
              className="flex flex-row items-center gap-3 w-full rounded-2xl px-3 py-2.5 border"
              style={{
                borderColor:
                  position === 0 ? player.color : 'rgba(255,255,255,0.08)',
                background:
                  position === 0
                    ? `linear-gradient(135deg, ${player.color}22, rgba(255,255,255,0.03))`
                    : 'rgba(255,255,255,0.03)',
              }}
            >
              <span className="w-7 text-center text-lg shrink-0">
                {MEDALS[position] || position + 1}
              </span>
              <span
                className="flex items-center justify-center w-9 h-9 rounded-xl text-xl shrink-0"
                style={{ backgroundColor: player.color }}
              >
                {player.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-text-primary truncate">
                  {player.name}
                </div>
                <div className="text-xs text-text-secondary">
                  {firstWins[player.index]} ván nhất · cao nhất +
                  {bestRound[player.index]}
                </div>
              </div>
              <span
                className="text-2xl font-extrabold tabular-nums shrink-0"
                style={{ color: player.color }}
              >
                {totals[player.index]}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
            <span className="text-text-secondary">Tổng số ván</span>
            <span className="font-bold">{state.rounds.length}</span>
          </div>
          {state.mode === 'rounds' && (
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <span className="text-text-secondary">Số ván đã chơi</span>
              <span className="font-bold">
                {state.rounds.length} / {state.totalRounds}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
            <span className="text-text-secondary">Về Nhất nhiều nhất</span>
            <span className="font-bold">
              {topFirstWinner.emoji} {topFirstWinner.name} (
              {firstWins[topFirstWinner.index]})
            </span>
          </div>
        </div>

        <button
          onClick={resetMatch}
          className="mt-1 w-full bg-primary-main active:scale-[0.98] text-white font-bold px-4 py-4 rounded-2xl duration-150 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]"
        >
          🔄 Trận mới
        </button>
      </div>
    </div>
  );
};
