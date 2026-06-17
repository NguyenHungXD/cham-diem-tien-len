import { useState } from 'react';
import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';
import { presetColors, presetEmojis } from '../../Types/CardGame';

const Wrapper = twc.div`flex flex-col items-center w-full min-h-[100dvh] px-4 pt-8 pb-12 gap-6 max-w-md mx-auto`;

const Title = twc.h1`text-3xl font-extrabold text-center tracking-tight`;

const Subtitle = twc.div`flex flex-wrap items-center justify-center gap-1.5 -mt-2`;

const Pill = twc.span`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/8 text-text-secondary`;

const Card = twc.div`glass w-full flex flex-col gap-3 rounded-3xl p-4`;

const SectionLabel = twc.div`text-xs font-bold uppercase tracking-wider text-text-secondary px-1`;

const StartButton = twc.button`mt-2 w-full bg-primary-main active:scale-[0.98] text-white font-bold text-lg px-6 py-4 rounded-2xl duration-150 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]`;

const SheetOverlay = twc.div`fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-pop-in`;

const Sheet = twc.div`w-full sm:max-w-sm bg-[#161827] rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-4 max-h-[80dvh]`;

type Editing = { index: number } | null;

export const SetupScreen = () => {
  const {
    state,
    setPlayerName,
    setPlayerEmoji,
    setPlayerColor,
    setMaxScore,
    setGameMode,
    setTotalRounds,
    startMatch,
  } = useCardGame();
  const [editing, setEditing] = useState<Editing>(null);

  const editingPlayer =
    editing !== null ? state.players.find((p) => p.index === editing.index) : null;

  return (
    <Wrapper>
      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="text-5xl">🃏</div>
        <Title>Chấm Điểm Tiến Lên</Title>
      </div>
      <Subtitle>
        <Pill>🥇 Nhất +3</Pill>
        <Pill>🥈 Nhì +2</Pill>
        <Pill>🥉 Ba +1</Pill>
        <Pill>Bét 0</Pill>
      </Subtitle>

      <Card>
        <SectionLabel>Người chơi</SectionLabel>
        {state.players.map((player) => (
          <div
            key={player.index}
            className="flex flex-row items-center gap-3 rounded-2xl bg-white/5 p-2"
          >
            <button
              onClick={() => setEditing({ index: player.index })}
              className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl shrink-0 active:scale-95 duration-150"
              style={{ backgroundColor: player.color }}
              aria-label="Đổi avatar và màu"
            >
              {player.emoji}
            </button>
            <input
              value={player.name}
              maxLength={20}
              onChange={(e) => setPlayerName(player.index, e.target.value)}
              placeholder={`Người chơi ${player.index + 1}`}
              className="flex-1 min-w-0 bg-transparent text-text-primary text-lg font-medium outline-none border-none placeholder:text-text-secondary/50"
            />
            <button
              onClick={() => setEditing({ index: player.index })}
              className="text-text-secondary text-sm px-2 py-1 rounded-lg active:bg-white/10 shrink-0"
            >
              Sửa
            </button>
          </div>
        ))}
      </Card>

      <Card>
        <SectionLabel>Chế độ chơi</SectionLabel>
        <div className="flex flex-row gap-2">
          <button
            onClick={() => setGameMode('score')}
            className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm duration-150 ${state.mode === 'score' ? 'bg-primary-main text-white' : 'bg-white/8 text-text-secondary'}`}
          >
            Về đích theo điểm
          </button>
          <button
            onClick={() => setGameMode('rounds')}
            className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm duration-150 ${state.mode === 'rounds' ? 'bg-primary-main text-white' : 'bg-white/8 text-text-secondary'}`}
          >
            Chơi đủ số ván
          </button>
        </div>
      </Card>

      {state.mode === 'score' && (
        <Card>
          <SectionLabel>Điểm về đích</SectionLabel>
          <div className="flex flex-row items-center gap-3">
            <input
              type="range"
              min={10}
              max={200}
              step={5}
              value={Math.min(200, state.maxScore)}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={1}
                max={9999}
                value={state.maxScore}
                onChange={(e) =>
                  setMaxScore(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))
                }
                className="w-20 bg-white/8 text-text-primary rounded-xl px-3 py-2 outline-none border-none text-center font-bold text-lg"
              />
            </div>
          </div>
          <p className="text-xs text-text-secondary px-1">
            Ai chạm mốc này trước sẽ kết thúc trận.
          </p>
        </Card>
      )}

      {state.mode === 'rounds' && (
        <Card>
          <SectionLabel>Số ván chơi</SectionLabel>
          <div className="flex flex-row items-center gap-3">
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={state.totalRounds}
              onChange={(e) => setTotalRounds(Number(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={1}
                max={99}
                value={state.totalRounds}
                onChange={(e) =>
                  setTotalRounds(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
                }
                className="w-20 bg-white/8 text-text-primary rounded-xl px-3 py-2 outline-none border-none text-center font-bold text-lg"
              />
            </div>
          </div>
          <p className="text-xs text-text-secondary px-1">
            Chơi đủ số ván rồi tổng hợp điểm.
          </p>
        </Card>
      )}

      {/* Chia sẻ game */}
      <div className="w-full">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href).catch(() => {});
            alert('Đã copy link trang này! Gửi cho bạn bè để họ truy cập.\n\nSau đó trong lúc chơi, bấm "Chia sẻ điểm" ở bảng điểm để gửi cập nhật.');
          }}
          className="w-full bg-white/8 active:scale-[0.98] text-text-primary font-bold px-4 py-3.5 rounded-2xl duration-150 flex items-center justify-center gap-2"
        >
          🔗 Chia sẻ link bảng điểm
        </button>
      </div>

      <StartButton onClick={startMatch}>Bắt đầu chơi 🎮</StartButton>

      {editingPlayer && (
        <SheetOverlay onClick={() => setEditing(null)}>
          <Sheet onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-2xl text-2xl"
                  style={{ backgroundColor: editingPlayer.color }}
                >
                  {editingPlayer.emoji}
                </div>
                <span className="font-bold text-lg truncate">{editingPlayer.name}</span>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="text-text-secondary px-3 py-1 rounded-lg active:bg-white/10 font-semibold"
              >
                Xong
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Màu</SectionLabel>
              <div className="flex flex-row flex-wrap gap-2">
                {presetColors.map((color) => {
                  const active = editingPlayer.color === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setPlayerColor(editingPlayer.index, color)}
                      className="w-10 h-10 rounded-full duration-150 active:scale-90"
                      style={{
                        backgroundColor: color,
                        outline: active ? '3px solid white' : '3px solid transparent',
                        outlineOffset: '2px',
                      }}
                      aria-label={`Chọn màu ${color}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 overflow-auto">
              <SectionLabel>Biểu tượng</SectionLabel>
              <div className="grid grid-cols-6 gap-2">
                {presetEmojis.map((emoji) => {
                  const active = editingPlayer.emoji === emoji;
                  return (
                    <button
                      key={emoji}
                      onClick={() => setPlayerEmoji(editingPlayer.index, emoji)}
                      className="flex items-center justify-center aspect-square rounded-xl text-2xl duration-150 active:scale-90"
                      style={{
                        backgroundColor: active
                          ? editingPlayer.color
                          : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          </Sheet>
        </SheetOverlay>
      )}
    </Wrapper>
  );
};
