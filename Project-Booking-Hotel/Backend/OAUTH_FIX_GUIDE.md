# Hướng Dẫn Sửa Lỗi OAuth (Google & Facebook)

## ⚡ Kiểm Tra Nhanh `appsettings.json`

**Đảm bảo các giá trị sau ĐÚNG:**

```json
{
  "ApiBaseUrl": "http://localhost:5000",     // ← Backend API (PORT 5000)
  "OAuth": {
    "RedirectUri": "http://localhost:5173"   // ← Frontend (PORT 5173)
  }
}
```

**❌ SAI nếu:**
- `ApiBaseUrl` = `http://localhost:5173` (đây là frontend, không phải backend!)
- `RedirectUri` = `http://localhost:5000` (đây là backend, không phải frontend!)

**✅ ĐÚNG:**
- `ApiBaseUrl` = Backend port (5000 hoặc 5001)
- `RedirectUri` = Frontend port (5173)

---

## 🔴 Vấn Đề

### 1. Lỗi Google OAuth
**Lỗi**: `redirect_uri_mismatch`  
**Nguyên nhân**: Redirect URI trong Google Cloud Console không khớp với redirect URI mà backend C# đang sử dụng.

**Lỗi hiện tại**: Google đang cố redirect về `https://sxteddkozzqniebfstag.supabase.co/auth/v1/callback` 
nhưng backend C# mong đợi `http://localhost:5000/api/auth/google/callback`

### 2. Lỗi Facebook OAuth
**Lỗi**: Redirect URI mismatch tương tự  
**Nguyên nhân**: Redirect URI trong Facebook Developer Console không khớp với redirect URI 
mà backend C# đang sử dụng.

---

## ✅ Giải Pháp

Cần cấu hình lại redirect URIs trong cả **Google Cloud Console** và **Facebook Developer Console** để 
khớp với backend C# API.

---

## 🔧 Cấu Hình Google OAuth

### Bước 1: Truy cập Google Cloud Console

1. Đi tới: https://console.cloud.google.com/
2. Chọn project của bạn (hoặc tạo project mới)
3. Vào **APIs & Services** → **Credentials**
4. Tìm OAuth 2.0 Client ID: `58279057551-8c4ref9g41f9ed1hkm6kvgfhln7jdub4.apps.googleusercontent.com`
5. Click vào để chỉnh sửa

### Bước 2: Cấu hình Authorized redirect URIs

Trong phần **Authorized redirect URIs**, bạn hiện đang có:
- ❌ `https://localhost:5173/signin-google` (SAI - đây là frontend URL)
- ❌ `http://localhost:5173` (SAI - đây là frontend URL)
- ❌ `https://localhost:5000/signin-google` (SAI - path không đúng)
- ❌ `https://sxteddkozzqniebfstag.supabase.co/auth/v1/callback` (SAI - đây là Supabase, không phải backend C#)

**CẦN XÓA** các URIs sai ở trên và **THÊM** các URIs đúng sau:

#### Cho Development (Local):
```
http://localhost:5000/api/auth/google/callback
http://localhost:5001/api/auth/google/callback
```

#### Cho Production (khi deploy):
```
https://your-api-domain.com/api/auth/google/callback
```

**Lưu ý quan trọng**:
- ✅ **PHẢI** thêm cả HTTP và HTTPS nếu backend chạy trên cả 2
- ✅ **PHẢI** khớp chính xác với URL trong `AuthService.cs` (dòng 138)
- ✅ **PHẢI** có path `/api/auth/google/callback` (không phải `/signin-google`)
- ❌ **KHÔNG** sử dụng Supabase callback URL nữa nếu bạn dùng backend C#
- ❌ **KHÔNG** dùng frontend URL (`localhost:5173`) làm redirect URI cho OAuth

### Bước 3: Kiểm tra cấu hình

Sau khi lưu, đảm bảo:
- ✅ Client ID: `58279057551-8c4ref9g41f9ed1hkm6kvgfhln7jdub4.apps.googleusercontent.com`
- ✅ Client Secret: `GOCSPX-DmFUg23K1WkKd307hM8s5U8U7VU` (đã có trong `appsettings.json`)
- ✅ Authorized redirect URIs đã được thêm đúng

---

## 🔧 Cấu Hình Facebook OAuth

### Bước 1: Truy cập Facebook Developer Console

1. Đi tới: https://developers.facebook.com/
2. Chọn app của bạn (App ID: `1582823942902981`)
3. Vào **Settings** → **Basic**
4. Scroll xuống phần **Facebook Login Settings**

### Bước 2: Cấu hình App Domains (QUAN TRỌNG!)

**Trước tiên**, trong phần **App Domains** (Miền ứng dụng), đảm bảo có:
```
localhost
```

Điều này cần thiết để Facebook cho phép redirect về `localhost`.

### Bước 3: Cấu hình Valid OAuth Redirect URIs

Vào **Facebook Login** → **Settings** (hoặc **Products** → **Facebook Login** → **Settings**)

Trong phần **Valid OAuth Redirect URIs**, thêm các URIs sau:

#### Cho Development (Local):
```
http://localhost:5000/api/auth/facebook/callback
http://localhost:5001/api/auth/facebook/callback
```

#### Cho Production (khi deploy):
```
https://your-api-domain.com/api/auth/facebook/callback
```

**Lưu ý quan trọng**:
- ✅ **PHẢI** thêm `localhost` vào **App Domains** trước
- ✅ **PHẢI** thêm cả HTTP và HTTPS nếu backend chạy trên cả 2
- ✅ **PHẢI** khớp chính xác với URL trong `AuthService.cs` (dòng 188)
- ❌ **KHÔNG** sử dụng Supabase callback URL nữa nếu bạn dùng backend C#

### Bước 3: Kiểm tra cấu hình

Sau khi lưu, đảm bảo:
- ✅ App ID: `1582823942902981`
- ✅ App Secret: `6642359113e8dfe9e5373f6ec875403a` (đã có trong `appsettings.json`)
- ✅ Valid OAuth Redirect URIs đã được thêm đúng

---

## 📋 Kiểm Tra Code Backend

### File: `AuthService.cs`

Đảm bảo các redirect URIs trong code khớp với cấu hình:

#### Google Callback (dòng 138):
```csharp
var redirectUri = _configuration["OAuth:RedirectUri"] ?? "http://localhost:5000/api/auth/google/callback";
```

**Lưu ý**: Dòng này đang dùng `OAuth:RedirectUri` từ config, nhưng nên dùng `ApiBaseUrl` + path để nhất quán.

#### Facebook Callback (dòng 188):
```csharp
var redirectUri = $"{apiBaseUrl}/api/auth/facebook/callback";
```

✅ Đây là cách đúng - sử dụng `ApiBaseUrl` từ config.

### File: `appsettings.json`

Kiểm tra các giá trị sau - **PHẢI ĐÚNG** như sau:

```json
{
  "ApiBaseUrl": "http://localhost:5000",  // ← URL của backend C# API (PORT 5000, KHÔNG PHẢI 5173!)
  "OAuth": {
    "Google": {
      "ClientId": "58279057551-8c4ref9g41f9ed1hkm6kvgfhln7jdub4.apps.googleusercontent.com",
      "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"  // ← Điền secret của bạn vào đây
    },
    "Facebook": {
      "AppId": "1582823942902981",
      "AppSecret": "YOUR_FACEBOOK_APP_SECRET"  // ← Điền secret của bạn vào đây
    },
    "RedirectUri": "http://localhost:5173"  // ← Frontend URL (PORT 5173 - đúng rồi)
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com"  // ← Đúng rồi
  }
}
```

**⚠️ QUAN TRỌNG - Phân biệt 2 URLs:**

1. **`ApiBaseUrl`** = `http://localhost:5000`
   - ✅ Đây là URL của **backend C# API**
   - ✅ Port **5000** (backend)
   - ✅ OAuth providers (Google/Facebook) sẽ redirect về đây
   - ❌ **KHÔNG PHẢI** `localhost:5173` (đó là frontend)

2. **`OAuth:RedirectUri`** = `http://localhost:5173`
   - ✅ Đây là URL của **frontend React**
   - ✅ Port **5173** (frontend)
   - ✅ Backend C# sẽ redirect về đây sau khi xử lý OAuth xong
   - ✅ Đúng rồi, không cần sửa

**Giải thích**:
- `ApiBaseUrl`: URL của backend C# API (nơi nhận OAuth callback từ Google/Facebook)
- `OAuth:RedirectUri`: URL của frontend (nơi backend redirect sau khi xử lý OAuth thành công)

---

## 🔄 Flow OAuth Hoàn Chỉnh

### Google OAuth Flow:

1. **Frontend** → Gọi `GET /api/auth/oauth/urls` để lấy Google Auth URL
2. **User** → Click vào Google Auth URL → Được redirect đến Google
3. **Google** → Xác thực user → Redirect về `http://localhost:5000/api/auth/google/callback?code=...`
4. **Backend C#** → Nhận code → Exchange code lấy token → Lấy user info
5. **Backend C#** → Redirect về frontend: `http://localhost:5173/auth/callback?provider=google&email=...`

### Facebook OAuth Flow:

1. **Frontend** → Gọi `GET /api/auth/oauth/urls` để lấy Facebook Auth URL
2. **User** → Click vào Facebook Auth URL → Được redirect đến Facebook
3. **Facebook** → Xác thực user → Redirect về `http://localhost:5000/api/auth/facebook/callback?code=...`
4. **Backend C#** → Nhận code → Exchange code lấy token → Lấy user info
5. **Backend C#** → Redirect về frontend: `http://localhost:5173/auth/callback?provider=facebook&email=...`

---

## 🐛 Sửa Lỗi Trong Code (Nếu Cần)

### Vấn đề: Google callback dùng sai redirect URI

Trong `AuthService.cs` dòng 138, code đang dùng:
```csharp
var redirectUri = _configuration["OAuth:RedirectUri"] ?? "http://localhost:5000/api/auth/google/callback";
```

**Nên sửa thành** (để nhất quán với Facebook):
```csharp
var apiBaseUrl = _configuration["ApiBaseUrl"] ?? "http://localhost:5000";
var redirectUri = $"{apiBaseUrl}/api/auth/google/callback";
```

---

## ✅ Checklist Sau Khi Sửa

- [ ] Đã thêm redirect URIs vào Google Cloud Console
- [ ] Đã thêm redirect URIs vào Facebook Developer Console
- [ ] Đã kiểm tra `appsettings.json` có đúng Client ID/Secret
- [ ] Đã test Google OAuth flow
- [ ] Đã test Facebook OAuth flow
- [ ] Đã kiểm tra logs backend khi có lỗi

---

## 🧪 Test OAuth

### Test Google OAuth:

1. Start backend: `dotnet run` (chạy tại `http://localhost:5000`)
2. Gọi API: `GET http://localhost:5000/api/auth/oauth/urls`
3. Copy `GoogleAuthUrl` và mở trong browser
4. Đăng nhập Google
5. Kiểm tra xem có redirect về `http://localhost:5000/api/auth/google/callback` không
6. Kiểm tra xem có redirect về frontend `http://localhost:5173/auth/callback` không

### Test Facebook OAuth:

1. Start backend: `dotnet run` (chạy tại `http://localhost:5000`)
2. Gọi API: `GET http://localhost:5000/api/auth/oauth/urls`
3. Copy `FacebookAuthUrl` và mở trong browser
4. Đăng nhập Facebook
5. Kiểm tra xem có redirect về `http://localhost:5000/api/auth/facebook/callback` không
6. Kiểm tra xem có redirect về frontend `http://localhost:5173/auth/callback` không

---

## 📝 Ghi Chú Quan Trọng

1. **Redirect URI phải khớp chính xác**: Không có trailing slash, không có query params (trừ code)
2. **HTTP vs HTTPS**: Nếu backend chạy HTTPS, phải dùng HTTPS trong redirect URI
3. **Localhost**: Google và Facebook đều cho phép localhost trong development
4. **Production**: Khi deploy, nhớ cập nhật redirect URIs trong cả Google và Facebook console
5. **Supabase**: Nếu bạn đang dùng backend C# thay vì Supabase Auth, không cần cấu hình Supabase callback URLs nữa

---

## 🔗 Tài Liệu Tham Khảo

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Facebook OAuth Documentation](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow)
- [OAuth 2.0 Redirect URI Best Practices](https://www.oauth.com/oauth2-servers/redirect-uris/)

---

## 💡 Troubleshooting

### Lỗi vẫn còn sau khi sửa?

1. **Clear browser cache**: Đôi khi browser cache redirect URIs cũ
2. **Kiểm tra lại config**: Đảm bảo đã save trong Google/Facebook console
3. **Kiểm tra logs backend**: Xem log để biết redirect URI nào đang được sử dụng
4. **Test với Postman/curl**: Gọi trực tiếp OAuth URL để xem redirect URI

### Lỗi "Invalid client" hoặc "Invalid redirect_uri"?

- Kiểm tra Client ID/Secret có đúng không
- Kiểm tra redirect URI có khớp chính xác không (case-sensitive)
- Đợi vài phút sau khi save config (có thể có delay)

---

**Tạo bởi**: AI Assistant  
**Ngày**: 2025-01-27  
**Phiên bản**: 1.0

