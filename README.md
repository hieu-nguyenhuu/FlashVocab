# ⚡ FlashVocab – Web App

Ứng dụng học từ vựng flashcard với Supabase backend.  
Stack: **React + Vite + Tailwind CSS + Supabase JS**

---

## 🚀 Cài đặt & Chạy local

### 1. Clone / copy thư mục này

### 2. Tạo file `.env` (copy từ `.env.example`)

```bash
cp .env.example .env
```

Điền vào 3 biến:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_TABLE_NAME=Vocabulary
```

> 💡 Tìm URL và anon key tại: Supabase Dashboard → Project Settings → API

### 3. Install & chạy

```bash
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

---

## ☁️ Deploy lên Vercel (MIỄN PHÍ – Khuyến nghị)

### Tại sao Vercel?
- ✅ Miễn phí hoàn toàn cho cá nhân
- ✅ Deploy bằng drag & drop hoặc GitHub push
- ✅ HTTPS tự động
- ✅ CDN toàn cầu, nhanh trên mọi thiết bị

### Cách 1: Drag & Drop (Nhanh nhất – không cần GitHub)

1. Chạy `npm run build` → tạo thư mục `dist/`
2. Vào [vercel.com](https://vercel.com) → Đăng ký/đăng nhập (dùng Google)
3. Kéo thả thư mục **`dist/`** vào trang Vercel
4. Vào **Settings → Environment Variables**, thêm 3 biến:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TABLE_NAME`
5. **Redeploy** (vì env vars cần có lúc build)

> ⚠️ Mỗi khi update code, bạn cần build lại và drag & drop lại.

### Cách 2: GitHub + Vercel (Khuyến nghị để dễ update)

1. Tạo repo GitHub (private hoặc public)
2. Push code lên:
   ```bash
   git init
   git add .
   git commit -m "init"
   git remote add origin https://github.com/username/flashvocab.git
   git push -u origin main
   ```
3. Vào [vercel.com](https://vercel.com) → **New Project** → Import repo
4. Vercel tự detect Vite framework
5. Thêm **Environment Variables** (3 biến VITE_*)
6. Click **Deploy**

**Sau này muốn update:** chỉ cần `git push` → Vercel tự build & deploy lại!

---

## 📱 Responsive

App hỗ trợ đầy đủ:
- 📱 **Mobile** (≤640px): Sidebar ẩn, mở bằng nút hamburger ☰
- 📟 **Tablet** (640–1024px): Layout tối ưu, bảng responsive
- 💻 **Desktop** (≥1024px): Sidebar cố định, bảng đầy đủ cột

---

## 🔑 Supabase RLS (Row Level Security)

Vì dùng anon key trực tiếp ở browser, bạn nên bật RLS trên bảng Vocabulary.

Cách đơn giản nhất (chỉ bạn dùng app): disable RLS hoàn toàn (đã là mặc định của project mới) — an toàn vì app không có dữ liệu nhạy cảm.

Nếu muốn an toàn hơn: bật Auth trong Supabase và thêm policy `auth.uid() IS NOT NULL`.

---

## 📁 Cấu trúc project

```
flashvocab/
├── src/
│   ├── lib/
│   │   └── supabase.js        # Supabase client + CRUD helpers
│   ├── components/
│   │   ├── UI.jsx             # StarRating, Modal, Toast, ProgressBar
│   │   ├── VocabTable.jsx     # Bảng từ vựng + phân trang
│   │   ├── FlashCard.jsx      # Thẻ từ vựng
│   │   ├── FlashCardSession.jsx  # Phiên ôn tập flashcard
│   │   ├── DeepPractice.jsx   # 4 bài tập chuyên sâu
│   │   ├── EditVocabModal.jsx # Modal chỉnh sửa
│   │   ├── ImportModal.jsx    # Modal nhập CSV
│   │   └── TempFlashModal.jsx # Modal thẻ tạm thời
│   ├── App.jsx                # Main layout + state management
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── .env.example
└── package.json
```
