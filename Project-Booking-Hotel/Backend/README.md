# Backend - C# ASP.NET Core API

Đây là phần backend C# của dự án Hotel Booking, cung cấp các API endpoints để xử lý business logic.

## 📁 Cấu trúc

```
Backend/
└── HotelBooking.API/
    ├── Controllers/          # API Controllers
    │   └── BookingsController.cs
    ├── Services/             # Business Logic Services
    │   ├── IBookingService.cs
    │   └── BookingService.cs
    ├── Models/               # Data Models
    │   └── BookingModels.cs
    ├── Program.cs            # Application entry point
    ├── appsettings.json      # Configuration
    └── HotelBooking.API.csproj
```

## 🚀 Chạy API

### Yêu cầu
- .NET 8.0 SDK hoặc mới hơn
- Visual Studio 2022 hoặc VS Code với C# extension

### Các bước

1. **Mở terminal trong thư mục Backend**
```bash
cd Backend/HotelBooking.API
```

2. **Restore packages**
```bash
dotnet restore
```

3. **Chạy API**
```bash
dotnet run
```

API sẽ chạy tại:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

## 📡 API Endpoints

### 1. Tính giá booking
```
POST /api/bookings/calculate-price
Content-Type: application/json

{
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-18",
  "basePricePerNight": 100,
  "baseCapacity": 2,
  "numAdults": 2,
  "numChildren": 1,
  "promoCode": "WELCOME25"
}
```

**Response:**
```json
{
  "basePrice": 300,
  "weekendSurcharge": 45,
  "guestSurcharge": 60,
  "discount": 75,
  "subtotal": 405,
  "total": 330,
  "nights": 3,
  "breakdown": [
    "Base price: $300.00 (3 nights × $100.00)",
    "Weekend surcharge: $45.00",
    "Guest surcharge: $60.00 (1 extra guests)",
    "Promotion discount: -$75.00",
    "Total: $330.00"
  ]
}
```

### 2. Validate booking
```
POST /api/bookings/validate
Content-Type: application/json

{
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-18",
  "numAdults": 2,
  "numChildren": 1,
  "baseCapacity": 2,
  "maxCapacity": 4
}
```

**Response:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": ["Extra guest charges will apply"]
}
```

### 3. Generate confirmation code
```
GET /api/bookings/generate-confirmation-code?type=room
```

**Response:**
```json
{
  "confirmationCode": "ROOM-12345"
}
```

## 🔗 Tích hợp với Frontend

### Cách 1: Gọi trực tiếp từ React

Tạo file `src/services/apiService.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const calculateBookingPrice = async (bookingData) => {
  const response = await fetch(`${API_URL}/api/bookings/calculate-price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      basePricePerNight: bookingData.basePrice,
      baseCapacity: bookingData.baseCapacity,
      numAdults: bookingData.adults,
      numChildren: bookingData.kids,
      promoCode: bookingData.promoCode
    })
  });
  return response.json();
};
```

### Cách 2: Sử dụng trong RoomDetails

```javascript
import { calculateBookingPrice } from '../services/apiService';

// Trong component
const handleCalculatePrice = async () => {
  const result = await calculateBookingPrice({
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    basePrice: room.price,
    baseCapacity: room.baseCapacity,
    adults: reservation.adults,
    kids: reservation.kids,
    promoCode: reservation.promoCode
  });
  
  setPricing(result);
};
```

## 🎯 Tính năng

- ✅ **Tính giá tự động**: Base price + weekend surcharge + guest surcharge - promotion
- ✅ **Validate booking**: Kiểm tra dates, guests, capacity
- ✅ **Generate confirmation code**: Tạo mã xác nhận tự động
- ✅ **Swagger documentation**: API docs tự động

## 📝 Ghi chú

- API này là **optional** - Frontend vẫn có thể hoạt động độc lập với Supabase
- Có thể mở rộng thêm: Payment processing, Email service, PDF generation
- Xem `BACKEND_INTEGRATION_IDEAS.md` để biết thêm ý tưởng tích hợp

