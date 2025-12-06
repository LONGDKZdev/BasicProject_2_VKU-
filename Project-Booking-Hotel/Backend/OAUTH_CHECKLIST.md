# ✅ Checklist Sửa Lỗi OAuth

## 📋 File `appsettings.json` - ĐÃ ĐÚNG ✅

File của bạn đã được cấu hình đúng:
- ✅ `ApiBaseUrl`: `http://localhost:5000` (backend API)
- ✅ `RedirectUri`: `http://localhost:5173` (frontend)
- ✅ `OAuth:Google:ClientId`: Đã có
- ✅ `OAuth:Google:ClientSecret`: Đã có (***)
- ✅ `OAuth:Facebook:AppId`: Đã có
- ✅ `OAuth:Facebook:AppSecret`: Đã có (***)
- ✅ `Email:SmtpHost`: `smtp.gmail.com`

---

## 🔧 CẦN LÀM TIẾP - Cấu Hình OAuth Providers

### 1. Google Cloud Console ⚠️ CẦN SỬA

**URL**: https://console.cloud.google.com/apis/credentials

**Bước 1**: Tìm OAuth Client ID: `58279057551-8c4ref9g41f9ed1hkm6kvgfhln7jdub4.apps.googleusercontent.com`

**Bước 2**: Xóa các redirect URIs SAI hiện tại:
- ❌ `https://localhost:5173/signin-google`
- ❌ `http://localhost:5173`
- ❌ `https://localhost:5000/signin-google`
- ❌ `https://sxteddkozzqniebfstag.supabase.co/auth/v1/callback`

**Bước 3**: Thêm các redirect URIs ĐÚNG:
- ✅ `http://localhost:5000/api/auth/google/callback`
- ✅ `http://localhost:5001/api/auth/google/callback` (nếu dùng HTTPS)

**Bước 4**: Click **SAVE**

---

### 2. Facebook Developer Console ⚠️ CẦN SỬA

**URL**: https://developers.facebook.com/apps/1582823942902981/settings/basic/

#### Bước 1: Thêm App Domain

1. Vào **Settings** → **Basic**
2. Tìm phần **App Domains** (Miền ứng dụng)
3. Thêm: `localhost`
4. Click **Save changes**

#### Bước 2: Cấu hình OAuth Redirect URIs

1. Vào **Products** → **Facebook Login** → **Settings**
   (Hoặc: https://developers.facebook.com/apps/1582823942902981/fb-login/settings/)
2. Tìm phần **Valid OAuth Redirect URIs**
3. Thêm các URIs sau:
   - ✅ `http://localhost:5000/api/auth/facebook/callback`
   - ✅ `http://localhost:5001/api/auth/facebook/callback` (nếu dùng HTTPS)
4. Click **Save changes**

---

## 🧪 Test Sau Khi Sửa

### Test Google OAuth:

1. Start backend:
   ```bash
   cd Backend/HotelBooking.API
   dotnet run
   ```

2. Gọi API để lấy OAuth URL:
   ```bash
   GET http://localhost:5000/api/auth/oauth/urls
   ```

3. Copy `GoogleAuthUrl` và mở trong browser

4. Đăng nhập Google

5. Kiểm tra:
   - ✅ Redirect về `http://localhost:5000/api/auth/google/callback?code=...`
   - ✅ Sau đó redirect về `http://localhost:5173/auth/callback?provider=google&email=...`

### Test Facebook OAuth:

1. Gọi API để lấy OAuth URL:
   ```bash
   GET http://localhost:5000/api/auth/oauth/urls
   ```

2. Copy `FacebookAuthUrl` và mở trong browser

3. Đăng nhập Facebook

4. Kiểm tra:
   - ✅ Redirect về `http://localhost:5000/api/auth/facebook/callback?code=...`
   - ✅ Sau đó redirect về `http://localhost:5173/auth/callback?provider=facebook&email=...`

---

## ❌ Lỗi Thường Gặp

### Lỗi: "redirect_uri_mismatch" (Google)
- **Nguyên nhân**: Redirect URI trong Google Console không khớp
- **Giải pháp**: Kiểm tra lại đã thêm `http://localhost:5000/api/auth/google/callback` chưa

### Lỗi: "Miền của URL này không được đưa vào miền của ứng dụng" (Facebook)
- **Nguyên nhân**: Chưa thêm `localhost` vào App Domains
- **Giải pháp**: Vào Settings → Basic → App Domains → Thêm `localhost`

### Lỗi: Vẫn redirect về Supabase
- **Nguyên nhân**: Chưa xóa Supabase redirect URI trong Google Console
- **Giải pháp**: Xóa `https://sxteddkozzqniebfstag.supabase.co/auth/v1/callback`

---

## 📝 Ghi Chú

- Sau khi sửa trong Google/Facebook Console, có thể mất **5 phút đến vài giờ** để có hiệu lực
- Nếu test ngay mà vẫn lỗi, đợi vài phút rồi thử lại
- Clear browser cache nếu cần

---

**Tạo bởi**: AI Assistant  
**Ngày**: 2025-01-27

