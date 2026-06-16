import { useRef } from 'react';
import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';
import { RoundEntryDialog } from './RoundEntryDialog';
import { HistoryList } from './HistoryList';

const Wrapper = twc.div`relative flex flex-col items-center w-full max-w-[600px] mx-auto px-4 py-6 gap-4`;

const Header = twc.div`flex flex-row items-center justify-between w-full`;

const Title = twc.h1`text-2xl font-bold text-text-primary`;

const MaxScoreBadge = twc.div`text-sm text-text-secondary`;

const PlayerRow = twc.div`flex flex-row items-center gap-3 w-full rounded-xl px-4 py-3 border-2 transition-colors`;

const Rank = twc.div`text-xl font-bold text-text-secondary w-7 text-center shrink-0`;

const ColorDot = twc.div`w-6 h-6 rounded-full shrink-0`;

const Name = twc.div`flex-1 text-lg font-medium text-text-primary truncate`;

const Total = twc.div`text-3xl font-bold tabular-nums`;

const ActionRow = twc.div`flex flex-row gap-3 w-full mt-2`;

const PrimaryButton = twc.button`flex-1 bg-primary-main hover:bg-primary-dark text-text-primary font-bold px-4 py-3 rounded-md duration-200`;

const SecondaryButton = twc.button`flex-1 bg-secondary-main hover:bg-secondary-dark text-text-primary font-bold px-4 py-3 rounded-md duration-200`;

export const Scoreboard = () => {
  const { state, totals, leaderIndex, finishMatch } = useCardGame();
  const roundDialogRef = useRef<HTMLDialogElement | null>(null);

  // Xếp hạng theo tổng điểm giảm dần để hiển thị thứ tự
  const ranked = [...state.players].sort(
    (a, b) => totals[b.index] - totals[a.index]
  );

  return (
    <Wrapper>
      <Header>
        <Title>Bảng điểm Tiến Lên</Title>
        <MaxScoreBadge>Mục tiêu: {state.maxScore}</MaxScoreBadge>
      </Header>

      <div className="flex flex-col gap-2 w-full">
        {ranked.map((player, position) => {
          const total = totals[player.index];
          const isLeader = player.index === leaderIndex;
          const isNegative = total < 0;
          const isClose = !isNegative && total >= state.maxScore - 10;

          let borderColor = 'rgba(255,255,255,0.1)';
          let bgColor = 'rgba(255,255,255,0.03)';
          if (isNegative) {
            borderColor = '#ef4444';
            bgColor = 'rgba(239,68,68,0.15)';
          } else if (isLeader) {
            borderColor = player.color;
          }

          return (
            <PlayerRow
              key={player.index}
              className={isClose ? 'animate-pulse' : ''}
              style={{ borderColor, backgroundColor: bgColor }}
            >
              <Rank>{position + 1}</Rank>
              <ColorDot style={{ backgroundColor: player.color }} />
              <Name>
                {player.name}
                {isLeader && (
                  <span className="ml-2 text-xs text-icons-gold">★ dẫn đầu</span>
                )}
              </Name>
              <Total
                style={{ color: isNegative ? '#ef4444' : player.color }}
              >
                {total}
              </Total>
            </PlayerRow>
          );
        })}
      </div>

      <ActionRow>
        <SecondaryButton onClick={finishMatch}>Kết thúc trận</SecondaryButton>
        <PrimaryButton onClick={() => roundDialogRef.current?.showModal()}>
          Nhập ván mới
        </PrimaryButton>
      </ActionRow>

      <HistoryList />

      <RoundEntryDialog dialogRef={roundDialogRef} />
    </Wrapper>
  );
};
