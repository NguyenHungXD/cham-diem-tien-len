import { useCardGame } from '../../Hooks/useCardGame';

const MEDALS = ['🥇', '🥈', '🥉', ''];

export const MatchOver = () => {
  const { state, totals, resetMatch } = useCardGame();

  const ranked = [...state.players].sort(
    (a, b) => totals[b.index] - totals[a.index]
  );
  const winner = ranked[0];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background-settings backdrop-blur-md px-4 animate-pop-in">
      <div className="w-full max-w-md flex flex-col items-center gap-4 bg-[#161827] rounded-3xl p-6 border border-white/10">
        <div className="text-6xl">🏆</div>
        <div className="text-center">
          <div className="text-sm text-text-secondary font-semibold uppercase tracking-wider">
            Người thắng
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
              <span className="flex-1 font-bold text-text-primary truncate">
                {player.name}
              </span>
              <span
                className="text-2xl font-extrabold tabular-nums shrink-0"
                style={{ color: player.color }}
              >
                {totals[player.index]}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={resetMatch}
          className="mt-2 w-full bg-primary-main active:scale-[0.98] text-white font-bold px-4 py-4 rounded-2xl duration-150 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]"
        >
          🔄 Trận mới
        </button>
      </div>
    </div>
  );
};
