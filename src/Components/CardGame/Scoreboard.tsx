import { useEffect, useRef, useState } from 'react';
import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';
import { RoundEntryDialog } from './RoundEntryDialog';
import { HistoryList } from './HistoryList';

const Wrapper = twc.div`relative flex flex-col items-center w-full max-w-md mx-auto px-4 pt-6 pb-28 gap-4`;

const Header = twc.div`flex flex-row items-center justify-between w-full`;

const Title = twc.h1`text-2xl font-extrabold tracking-tight`;

const GoalBadge = twc.div`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/8 text-text-secondary`;

const MEDALS = ['🥇', '🥈', '🥉'];

const useAnimatedBump = (value: number) => {
  const [bump, setBump] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setBump(true);
      prev.current = value;
      const t = setTimeout(() => setBump(false), 400);
      return () => clearTimeout(t);
    }
  }, [value]);
  return bump;
};

const PlayerCard = ({
  position,
  player,
  total,
  isLeader,
  maxScore,
}: {
  position: number;
  player: { index: number; name: string; color: string; emoji: string };
  total: number;
  isLeader: boolean;
  maxScore: number;
}) => {
  const bump = useAnimatedBump(total);
  const isNegative = total < 0;
  const isClose = !isNegative && total < maxScore && total >= maxScore - 10;
  const progress = Math.max(0, Math.min(100, (total / maxScore) * 100));

  let animClass = '';
  if (isNegative) animClass = 'animate-danger-pulse';
  else if (isClose) animClass = 'animate-close-glow';

  return (
    <div
      className={`relative w-full rounded-3xl p-4 overflow-hidden border ${animClass}`}
      style={{
        borderColor: isNegative
          ? 'var(--color-danger)'
          : isLeader
            ? player.color
            : 'rgba(255,255,255,0.08)',
        background: `linear-gradient(135deg, ${player.color}22, rgba(255,255,255,0.03))`,
      }}
    >
      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-col items-center w-7 shrink-0">
          <span className="text-lg leading-none">
            {MEDALS[position] ?? ''}
          </span>
          <span className="text-xs font-bold text-text-secondary">{position + 1}</span>
        </div>

        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl shrink-0"
          style={{ backgroundColor: player.color }}
        >
          {player.emoji}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg truncate">{player.name}</span>
            {isLeader && <span className="text-icons-gold text-sm">👑</span>}
          </div>
          {isNegative ? (
            <span className="text-xs font-semibold text-danger">⚠️ Đang âm điểm</span>
          ) : isClose ? (
            <span className="text-xs font-semibold text-icons-gold">
              🔥 Sắp về đích!
            </span>
          ) : (
            <span className="text-xs text-text-secondary">
              Còn {Math.max(0, maxScore - total)} điểm
            </span>
          )}
        </div>

        <div
          className={`text-4xl font-extrabold tabular-nums shrink-0 ${bump ? 'animate-score-bump' : ''}`}
          style={{ color: isNegative ? 'var(--color-danger)' : player.color }}
        >
          {total}
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: isNegative ? 'var(--color-danger)' : player.color,
          }}
        />
      </div>
    </div>
  );
};

export const Scoreboard = () => {
  const { state, totals, leaderIndex, finishMatch } = useCardGame();
  const [roundOpen, setRoundOpen] = useState(false);

  const ranked = [...state.players].sort((a, b) => totals[b.index] - totals[a.index]);

  return (
    <Wrapper>
      <Header>
        <Title>Bảng điểm</Title>
        <GoalBadge>🎯 Về đích: {state.maxScore}</GoalBadge>
      </Header>

      <div className="flex flex-col gap-3 w-full">
        {ranked.map((player, position) => (
          <PlayerCard
            key={player.index}
            position={position}
            player={player}
            total={totals[player.index]}
            isLeader={player.index === leaderIndex}
            maxScore={state.maxScore}
          />
        ))}
      </div>

      <HistoryList />

      {/* Thanh hành động cố định dưới đáy, dễ bấm trên điện thoại */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[#0b0c16] via-[#0b0c16]/95 to-transparent max-w-md mx-auto">
        <button
          onClick={finishMatch}
          className="flex-1 bg-white/8 active:scale-[0.98] text-text-primary font-bold px-4 py-3.5 rounded-2xl duration-150"
        >
          Kết thúc
        </button>
        <button
          onClick={() => setRoundOpen(true)}
          className="flex-[1.6] bg-primary-main active:scale-[0.98] text-white font-bold px-4 py-3.5 rounded-2xl duration-150 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]"
        >
          + Nhập ván mới
        </button>
      </div>

      {roundOpen && <RoundEntryDialog onClose={() => setRoundOpen(false)} />}
    </Wrapper>
  );
};
