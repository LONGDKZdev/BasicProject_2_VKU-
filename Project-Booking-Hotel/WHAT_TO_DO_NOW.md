# 🎯 CẦN LÀM GÌ NGAY BÂY GIỜ?

## ✅ **ĐÃ HOÀN THÀNH**

1. ✅ Backend build thành công
2. ✅ Đã tạo các file hướng dẫn
3. ✅ Đã tạo template files
4. ✅ Đã cập nhật .gitignore

---

## 🔐 **CẦN LÀM NGAY (TRƯỚC KHI PUSH)**

### **1. Cấu hình appsettings.json**

File `Backend/HotelBooking.API/appsettings.json` hiện tại có:
- ✅ Google OAuth credentials (đã có)
- ❌ Facebook OAuth (chưa có - optional)
- ❌ Email SMTP (chưa có - cần cho password reset)

**Cần làm:**

1. **Email SMTP (QUAN TRỌNG cho password reset):**
   ```json
   "Email": {
     "SmtpHost": "smtp.gmail.com",
     "SmtpPort": "587",
     "SmtpUser": "your-email@gmail.com",
     "SmtpPassword": "your-16-char-app-password",
     "FromEmail": "your-email@gmail.com",
     "FromName": "Hotel Booking"
   }
   ```
   
   **Cách lấy Gmail App Password:**
   - Vào: https://myaccount.google.com/security
   - Bật 2-Step Verification (nếu chưa có)
   - Tạo App Password cho "Mail"
   - Copy 16 ký tự vào `SmtpPassword`

2. **Facebook OAuth (Optional - chỉ cần nếu dùng Facebook login):**
   - Vào: https://developers.facebook.com/
   - Tạo App mới
   - Copy App ID và App Secret vào `appsettings.json`

---

## 📝 **CHECKLIST TRƯỚC KHI PUSH**

### **Bước 1: Kiểm tra .gitignore**
```bash
# Đảm bảo appsettings.json đã được ignore
git check-ignore Backend/HotelBooking.API/appsettings.json
# Nếu không có output, cần thêm vào .gitignore
```

### **Bước 2: Kiểm tra không commit sensitive data**
```bash
# Kiểm tra xem có file sensitive nào đang được track không
git ls-files | grep -E "appsettings\.json|\.env"
# Nếu có, cần xóa khỏi git:
# git rm --cached Backend/HotelBooking.API/appsettings.json
```

### **Bước 3: Test lại**
```bash
# Test frontend
npm run dev

# Test backend
cd Backend/HotelBooking.API
dotnet run
```

### **Bước 4: Commit và Push**
```bash
git add .
git commit -m "Add setup documentation and templates"
git push
```

---

## 🎯 **TÓM TẮT**

### **Bắt buộc phải làm:**
1. ✅ Cấu hình Email SMTP trong `appsettings.json` (cho password reset)
2. ✅ Kiểm tra `.gitignore` đã ignore `appsettings.json` chưa
3. ✅ Test lại app chạy được

### **Tùy chọn:**
- Cấu hình Facebook OAuth (nếu muốn dùng)
- Test OAuth flow (nếu đã config)

### **Sau khi push:**
- Người khác clone về sẽ cần:
  1. Cài Node.js và .NET 8 SDK
  2. Chạy `npm install`
  3. Chạy `dotnet restore`
  4. Tạo `.env` và `appsettings.json` từ templates
  5. Chạy SQL scripts

**Xem chi tiết:** `SETUP_AFTER_CLONE.md`

---

## ⚠️ **LƯU Ý**

- **KHÔNG commit `appsettings.json`** - File này có credentials!
- **LUÔN commit `appsettings.json.template`** - Template không có secrets
- Nếu đã commit nhầm, xem hướng dẫn trong `CHECKLIST_BEFORE_PUSH.md`

