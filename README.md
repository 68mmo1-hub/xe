# MindMaze AI - Game Tư Duy Phản Biện

## 🚀 Hướng dẫn Chạy Cục bộ (Local)

1.  **Cài đặt thư viện:**
    Mở Terminal và chạy lệnh:
    ```bash
    npm install
    ```

2.  **Cấu hình API Key:**
    *   Mở file `.env.local` (nếu chưa có thì tạo mới).
    *   Dán mã API Key Google Gemini của bạn vào dòng:
        ```env
        VITE_GEMINI_API_KEY=AIzaSy_Mã_Key_Của_Bạn_Ở_Đây
        ```

3.  **Chạy ứng dụng:**
    ```bash
    npm run dev
    ```
    Truy cập vào đường link hiện ra (thường là `http://localhost:5173`).

---

## 🌐 Hướng dẫn Đưa lên GitHub Pages

Để game chạy được trên mạng và chia sẻ cho bạn bè:

**Bước 1: Đẩy code lên GitHub**
1.  Tạo repository mới trên GitHub.
2.  Chạy các lệnh sau trong Terminal:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/USERNAME/REPO_NAME.git
    git push -u origin main
    ```
    *(Thay `USERNAME` và `REPO_NAME` bằng thông tin của bạn)*

**Bước 2: Deploy**
1.  Chạy lệnh sau để build và đẩy lên nhánh `gh-pages`:
    ```bash
    npm run deploy
    ```
2.  Đợi vài phút, vào phần **Settings > Pages** trên GitHub để lấy link game.

**Quan trọng:**
Vì lý do bảo mật, file `.env.local` **không** được đẩy lên GitHub.
Để game trên GitHub Pages có thể gọi AI, bạn cần:
1.  Vào phần **Settings** của Repository trên GitHub.
2.  Chọn **Secrets and variables** > **Actions**.
3.  Tạo secret mới tên `VITE_GEMINI_API_KEY` và dán key của bạn vào.
4.  Hoặc (cách đơn giản cho demo): Sửa trực tiếp file `services/geminiService.ts` và dán cứng key vào hàm `getApiKey` (Lưu ý: sẽ lộ key nếu repo để Public).
