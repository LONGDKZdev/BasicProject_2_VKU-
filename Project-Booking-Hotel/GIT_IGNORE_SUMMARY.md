# 📋 Danh Sách Files Sẽ KHÔNG Được Commit (Bị Ignore)

Khi chạy `git add Project-Booking-Hotel`, các file/thư mục sau sẽ **KHÔNG** được add vào git:

---

## 🔒 Files Bị Ignore (Theo .gitignore)

### 1. **Dependencies & Build Files**
- ❌ `/node_modules/` - Node.js dependencies (rất lớn)
- ❌ `/.pnp/` - Yarn PnP files
- ❌ `.pnp.js` - Yarn PnP config

### 2. **Build & Production Files**
- ❌ `/build/` - Build output
- ❌ `/dist/` - Distribution files
- ❌ `/coverage/` - Test coverage reports

### 3. **Environment & Config Files**
- ❌ `.env` - Environment variables (chứa secrets)
- ❌ `.env.local`
- ❌ `.env.development.local`
- ❌ `.env.test.local`
- ❌ `.env.production.local`

### 4. **Backend C# Files**
- ❌ `Backend/**/bin/` - Compiled binaries
- ❌ `Backend/**/obj/` - Object files
- ❌ `Backend/**/appsettings.json` - **QUAN TRỌNG**: Chứa secrets!
- ❌ `Backend/**/appsettings.*.json` - Tất cả appsettings variants
- ❌ `Backend/**/*.user` - User-specific settings
- ❌ `Backend/**/*.suo` - Solution user options
- ❌ `Backend/**/.vs/` - Visual Studio folder

### 5. **Log Files**
- ❌ `npm-debug.log*`
- ❌ `yarn-debug.log*`
- ❌ `yarn-error.log*`

### 6. **Sensitive Files**
- ❌ `*.key` - Private keys
- ❌ `*.pem` - Certificate files
- ❌ `*.pfx` - Certificate files
- ❌ `secrets.json` - Secrets file

### 7. **System Files**
- ❌ `.DS_Store` - macOS system file

---

## ✅ Files SẼ Được Commit

### Frontend:
- ✅ `src/` - Tất cả source code React
- ✅ `public/` - Public assets
- ✅ `package.json` - Dependencies list
- ✅ `package-lock.json` - Lock file (quan trọng!)
- ✅ `vite.config.js` - Vite config
- ✅ `tailwind.config.cjs` - Tailwind config
- ✅ `index.html` - HTML entry

### Backend C#:
- ✅ `Backend/HotelBooking.API/*.cs` - Source code
- ✅ `Backend/HotelBooking.API/*.csproj` - Project file
- ✅ `Backend/HotelBooking.API/Program.cs` - Entry point
- ✅ `Backend/HotelBooking.API/appsettings.json.template` - **Template** (OK)
- ✅ `Backend/HotelBooking.API/Controllers/` - Controllers
- ✅ `Backend/HotelBooking.API/Services/` - Services
- ✅ `Backend/HotelBooking.API/Models/` - Models

### Documentation:
- ✅ `README.md`
- ✅ `SETUP_AFTER_CLONE.md`
- ✅ `Query_V2/*.sql` - SQL scripts
- ✅ Tất cả `.md` files

### Config Files:
- ✅ `.gitignore` - Git ignore rules
- ✅ `netlify.toml` - Netlify config
- ✅ `postcss.config.cjs` - PostCSS config

---

## 🔍 Kiểm Tra Thực Tế

Khi chạy `git status --ignored`, bạn sẽ thấy:

```
!! .env
!! Backend/HotelBooking.API/appsettings.json
!! Backend/HotelBooking.API/bin/
!! Backend/HotelBooking.API/obj/
!! node_modules/
```

Các file có `!!` ở đầu là **bị ignore** và sẽ **KHÔNG** được commit.

---

## ⚠️ Lưu Ý Quan Trọng

### ✅ AN TOÀN:
- `Backend/HotelBooking.API/appsettings.json` - **KHÔNG** được commit (chứa secrets)
- `.env` - **KHÔNG** được commit (chứa secrets)
- `node_modules/` - **KHÔNG** được commit (quá lớn)

### ✅ SẼ ĐƯỢC COMMIT:
- `Backend/HotelBooking.API/appsettings.json.template` - **CÓ** được commit (chỉ có placeholder)
- `package-lock.json` - **CÓ** được commit (quan trọng!)
- Tất cả source code

---

## 🧪 Test Nhanh

Để xem chính xác file nào sẽ được add:

```bash
# Xem file nào sẽ được add (không bị ignore)
git add Project-Booking-Hotel --dry-run

# Xem file nào bị ignore
git status --ignored
```

---

## 📝 Tóm Tắt

**Khi chạy `git add Project-Booking-Hotel`:**

✅ **SẼ ĐƯỢC ADD:**
- Tất cả source code (React + C#)
- Config files (không chứa secrets)
- Documentation
- `package-lock.json`
- `appsettings.json.template`

❌ **KHÔNG ĐƯỢC ADD:**
- `node_modules/`
- `.env`
- `Backend/**/appsettings.json` (file thật)
- `Backend/**/bin/` và `Backend/**/obj/`
- Build files (`dist/`, `build/`)

---

**Tạo bởi**: AI Assistant  
**Ngày**: 2025-01-27

