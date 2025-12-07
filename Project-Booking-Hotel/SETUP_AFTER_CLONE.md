# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN (QUICK START)

Chào mừng bạn đến với dự án **Hotel Booking System**.
Dự án sử dụng kiến trúc Hybrid: **ReactJS** (Frontend) + **.NET 8** (Backend) + **Supabase** (Database).

Để chạy dự án, bạn chỉ cần làm theo đúng 3 bước dưới đây.

---

## ✅ BƯỚC 1: CÀI ĐẶT MÔI TRƯỜNG
Đảm bảo máy bạn đã cài sẵn:
- [Node.js](https://nodejs.org/) (Phiên bản 18 trở lên)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Git

---

## 🔑 BƯỚC 2: NHẬP "CHÌA KHÓA" (QUAN TRỌNG NHẤT)
Vì lý do bảo mật, các file chứa mật khẩu không được đưa lên GitHub.
**Hãy liên hệ chủ dự án để nhận 2 file cấu hình:** `appsettings.json` và `.env`.

Sau khi nhận được, hãy copy chúng vào đúng vị trí sau:

| Tên file | Copy vào thư mục nào? |
| :--- | :--- |
| **`.env`** | Thư mục gốc (Nơi có file `package.json`) |
| **`appsettings.json`** | Thư mục `Backend/HotelBooking.API/` |

> ⚠️ **Lưu ý:** Nếu thiếu 2 file này, hệ thống sẽ báo lỗi ngay lập tức.

---

## 🗄️ BƯỚC 3: CÀI ĐẶT DATABASE (SUPABASE)
*(Nếu bạn dùng chung Database với team thì bỏ qua bước này. Nếu bạn muốn tạo Database riêng thì làm như sau)*

1. Vào [Supabase Dashboard](https://supabase.com/dashboard) tạo Project mới.
2. Vào mục **SQL Editor**, chạy lần lượt các file trong thư mục `Query_V2` theo thứ tự:
   1. `01_Clean_Data.sql`
   2. `02_Int_schema.sql`
   3. `03_Setup_RLS.sql`
   4. `04_Full_seed_data.sql`

---

## 🚀 BƯỚC 4: KHỞI ĐỘNG
Tại thư mục gốc, click đúp vào file:
👉 **`RunProject.bat`**

Hệ thống sẽ tự động:
1. Kiểm tra file cấu hình.
2. Cài đặt thư viện (nếu chạy lần đầu).
3. Mở 2 cửa sổ:
   - **Backend:** http://localhost:5000
   - **Frontend:** http://localhost:5173

**Hoàn tất!** Giờ bạn có thể truy cập Web và code.