import { useCardGame } from '../../Hooks/useCardGame';

export const RoomExpired = () => {
  const { leaveRoom } = useCardGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 gap-4 text-center">
      <div className="text-6xl mb-2">⏰</div>
      <h1 className="text-2xl font-extrabold">Phòng đã hết hạn</h1>
      <p className="text-text-secondary text-sm max-w-xs">
        Phòng chơi tồn tại trong 12 giờ. Có thể đã hết hạn hoặc chủ phòng đã kết thúc.
        Bạn vẫn có thể xem lại điểm đã lưu trong thiết bị.
      </p>
      <button
        onClick={leaveRoom}
        className="mt-4 bg-primary-main text-white font-bold px-6 py-3 rounded-2xl active:scale-[0.98] duration-150"
      >
        ← Về trang chủ
      </button>
    </div>
  );
};
