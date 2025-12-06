# 💬 TRẢ LỜI NHANH 2 CÂU HỎI

## ❓ **1. SAU KHI CLONE VỀ, CẦN CÀI GÌ?**

### **Bắt buộc:**
1. **Node.js** >= 18.x
   ```bash
   node --version  # Kiểm tra
   ```

2. **.NET 8 SDK** (chỉ cần nếu dùng Backend OAuth)
   ```bash
   dotnet --version  # Kiểm tra
   ```

### **Sau khi clone:**

```bash
# 1. Frontend dependencies
npm install
# HOẶC copy node_modules từ máy khác (như bạn nói)

# 2. Backend dependencies (nếu dùng)
cd Backend/HotelBooking.API
dotnet restore
# KHÔNG cần copy gì, dotnet restore tự tải packages
```

### **Cấu hình:**
1. Tạo `.env` file (xem `SETUP_AFTER_CLONE.md`)
2. Tạo `appsettings.json` từ template:
   ```bash
   copy Backend/HotelBooking.API/appsettings.json.template Backend/HotelBooking.API/appsettings.json
   ```
3. Điền credentials vào 2 file trên

### **Database:**
- Chạy SQL scripts trong `Query_V2/` theo thứ tự trong Supabase

**Xem chi tiết:** `SETUP_AFTER_CLONE.md`

---

## ❓ **2. CẦN LÀM GÌ NỮA KHÔNG?**

### **CẦN LÀM NGAY:**

1. **✅ Cấu hình Email SMTP trong `appsettings.json`**
   - Cần cho chức năng password reset
   - Xem hướng dẫn trong `Backend/SETUP_INSTRUCTIONS.md`
   - Hoặc xem `WHAT_TO_DO_NOW.md`

2. **✅ Kiểm tra .gitignore**
   - Đảm bảo `appsettings.json` không bị commit
   - Đã có trong `.gitignore` rồi: `Backend/**/appsettings.json`

3. **✅ Test lại app**
   ```bash
   # Frontend
   npm run dev
   
   # Backend (nếu dùng)
   cd Backend/HotelBooking.API
   dotnet run
   ```

### **TÙY CHỌN:**

- Cấu hình Facebook OAuth (nếu muốn dùng Facebook login)
- Test OAuth flow end-to-end

### **ĐÃ SẴN SÀNG:**

- ✅ Google OAuth credentials đã có trong `appsettings.json`
- ✅ Backend code đã hoàn chỉnh
- ✅ Frontend code đã hoàn chỉnh
- ✅ Documentation đã đầy đủ
- ✅ Template files đã tạo

---

## 📋 **CHECKLIST TRƯỚC KHI PUSH**

- [ ] Đã cấu hình Email SMTP trong `appsettings.json`
- [ ] Đã test app chạy được
- [ ] Đã kiểm tra `.gitignore` ignore `appsettings.json`
- [ ] Đã commit tất cả code và documentation
- [ ] Đã commit `appsettings.json.template`

**Xem chi tiết:** `CHECKLIST_BEFORE_PUSH.md`

---

## 🎯 **TÓM TẮT**

### **Câu 1: Cần cài gì?**
- Node.js + npm install (hoặc copy node_modules)
- .NET 8 SDK + dotnet restore (nếu dùng backend)
- Tạo `.env` và `appsettings.json` từ templates
- Chạy SQL scripts

### **Câu 2: Cần làm gì nữa?**
- Cấu hình Email SMTP (QUAN TRỌNG)
- Test lại app
- Kiểm tra .gitignore
- Push lên GitHub!

**Xem chi tiết:**
- `SETUP_AFTER_CLONE.md` - Hướng dẫn cho người clone về
- `WHAT_TO_DO_NOW.md` - Checklist cần làm ngay
- `CHECKLIST_BEFORE_PUSH.md` - Checklist trước khi push

