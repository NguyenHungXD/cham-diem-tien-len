const COLORS = [
  '#F0648C',
  '#3FBFA8',
  '#F2994A',
  '#6C7BD6',
  '#56A8E8',
  '#E0C04A',
  '#FF7B6B',
  '#B07BD6',
];

// Sinh sẵn các mảnh giấy một lần ở cấp module (ngoài render) để giữ hàm render thuần
const PIECES = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.8,
  duration: 2.4 + Math.random() * 1.8,
  color: COLORS[i % COLORS.length],
  size: 6 + Math.random() * 8,
  rounded: Math.random() > 0.5,
}));

// Mưa giấy nhẹ bằng CSS, tự dừng sau vài giây (mount/unmount bởi parent)
export const Confetti = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {PIECES.map((p) => (
        <span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.rounded ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
};
