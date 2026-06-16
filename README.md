# Chấm Điểm Tiến Lên - Bảng tính điểm đánh bài

[![PWA](https://img.shields.io/badge/PWA-Enabled-blue)](https://life-trinket.web.app/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Web **chấm điểm đánh bài Tiến Lên** cho **4 người chơi**, hoạt động **offline** (PWA), xây dựng bằng **React 19** và **TypeScript**. Nhập kết quả từng ván theo thứ hạng, cộng điểm thưởng, theo dõi điểm tích lũy và xác định người thắng chung cuộc.

## Cách chơi

### Thiết lập

1. Nhập tên cho 4 người chơi.
2. Đặt **điểm tối đa** (mốc về đích). Ai đạt mốc này trước thì trận kết thúc.
3. Bấm **Bắt đầu**.

### Tính điểm mỗi ván

Điểm được gán theo thứ hạng trong ván:

- 🥇 **Nhất**: +3
- 🥈 **Nhì**: +2
- 🥉 **Ba**: +1
- **Bét**: 0

Ngoài ra có thể nhập thêm **điểm thưởng** (cộng hoặc trừ) cho mỗi người trong từng ván, dùng cho các trường hợp như chặt heo, đốt, cháy bài...

### Bảng điểm

- Điểm được **cộng dồn** qua các ván, người có tổng cao nhất **dẫn đầu** (★).
- Người **còn cách mốc điểm tối đa ≤ 10 điểm** sẽ **nhấp nháy** để báo sắp về đích.
- Người có tổng điểm **âm** sẽ được **tô đỏ** cảnh báo.
- Có thể bấm **Kết thúc trận** bất kỳ lúc nào để xem bảng xếp hạng chung cuộc.

### Lịch sử

Mỗi ván đã nhập được liệt kê bên dưới bảng điểm, có thể xóa nếu nhập nhầm.

## 🚀 Tính năng

- 🌐 Web app, không cần cài đặt (có thể cài như PWA trên điện thoại)
- 📴 Hoạt động offline sau khi cài PWA
- 🆓 Miễn phí, không quảng cáo
- 🔢 Chấm điểm cố định 4 người chơi
- 🏆 Tự động kết thúc khi có người đạt điểm tối đa
- 💾 Tự lưu trạng thái vào trình duyệt (localStorage), reload không mất dữ liệu

## 🛠️ Công nghệ

- **Frontend**: React 19.2.0 (functional components + hooks)
- **Ngôn ngữ**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS v4 với react-twc
- **Build**: Vite với SWC
- **PWA**: vite-plugin-pwa với Workbox
- **Validation**: Zod
- **Lưu trữ**: LocalStorage có validate bằng Zod

## 📱 Cài đặt (PWA)

**iOS (Safari)**: Mở trang web → nút Share → "Add to Home Screen" → "Add".

**Android (Chrome)**: Mở trang web → menu (ba chấm) → "Install app" / "Add to Home Screen".

## For Development

```bash
# Cài dependencies (yêu cầu pnpm)
pnpm install

# Chạy dev server
pnpm run dev

# Build production
pnpm run build

# Xem thử bản build
pnpm run preview
```

Yêu cầu: Node.js >= 20, pnpm.

## 📄 License

Mã nguồn mở theo [MIT License](LICENSE).

Dự án này được phát triển từ [Life Trinket](https://github.com/Vikeo/LifeTrinket) của [Viktor Raadberg](https://github.com/Vikeo).
