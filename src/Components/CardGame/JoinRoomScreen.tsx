import { useState } from 'react';
import { twc } from 'react-twc';
import { useCardGame } from '../../Hooks/useCardGame';
import { presetColors, presetEmojis } from '../../Types/CardGame';

const Wrapper = twc.div`flex flex-col items-center w-full min-h-[100dvh] px-4 pt-12 pb-12 gap-6 max-w-md mx-auto`;

const Title = twc.h1`text-2xl font-extrabold text-center`;

const Card = twc.div`glass w-full flex flex-col gap-4 rounded-3xl p-4`;

const SectionLabel = twc.div`text-xs font-bold uppercase tracking-wider text-text-secondary px-1`;

const StartButton = twc.button`mt-2 w-full bg-primary-main active:scale-[0.98] text-white font-bold text-lg px-6 py-4 rounded-2xl duration-150 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]`;

export const JoinRoomScreen = ({ roomId }: { roomId: string }) => {
  const { joinRoom } = useCardGame();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(presetEmojis[0]);
  const [color, setColor] = useState(presetColors[0]);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await joinRoom(roomId, name.trim(), emoji, color);
    } catch {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col items-center gap-2">
        <div className="text-5xl">{emoji}</div>
        <Title>Tham gia phòng chơi</Title>
        <p className="text-sm text-text-secondary text-center">
          Mã phòng: <span className="font-bold text-primary-main">{roomId}</span>
        </p>
      </div>

      <Card>
        <SectionLabel>Tên của bạn</SectionLabel>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="Nhập tên..."
          className="w-full bg-white/8 text-text-primary rounded-xl px-3 py-3 outline-none border-none text-lg font-medium"
        />
      </Card>

      <Card>
        <SectionLabel>Biểu tượng</SectionLabel>
        <div className="grid grid-cols-6 gap-2">
          {presetEmojis.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`flex items-center justify-center aspect-square rounded-xl text-2xl duration-150 active:scale-90 ${
                emoji === e ? 'ring-2 ring-white' : 'bg-white/6'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>Màu</SectionLabel>
        <div className="flex flex-row flex-wrap gap-2">
          {presetColors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-10 h-10 rounded-full duration-150 active:scale-90"
              style={{
                backgroundColor: c,
                outline: color === c ? '3px solid white' : '3px solid transparent',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </Card>

      <StartButton onClick={handleJoin} disabled={!name.trim() || loading}>
        {loading ? 'Đang tham gia...' : 'Tham gia 🎮'}
      </StartButton>
    </Wrapper>
  );
};
