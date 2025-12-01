# 🏨 AI Hotel Booking Chatbox - Hướng Dẫn Sử Dụng

## 📋 Tính Năng Chính

### 1. **Tư Vấn Thông Minh** 🤖

- AI trợ lý hiểu tiếng Việt, hỗ trợ khách hàng 24/7
- Tự động gợi ý phòng phù hợp dựa trên nhu cầu
- Trả lời các câu hỏi về giá, tiện nghi, dịch vụ

### 2. **Tìm Kiếm Phòng Nhanh** 🔍

- Lọc phòng theo:
  - Ngày nhận/trả phòng
  - Số lượng người lớn & trẻ em
  - Sở thích & yêu cầu đặc biệt
- Hiển thị phòng nổi bật với giá cả rõ ràng

### 3. **Đặt Phòng Trực Tiếp** 📋

- Điền thông tin đặt phòng trong chatbox
- Hỗ trợ yêu cầu đặc biệt (tầng cao, gần biển, phòng yên tĩnh, v.v)
- Tạo mã xác nhận ngay lập tức
- Lưu lịch sử đặt phòng cho tài khoản đã đăng nhập

### 4. **Giao Diện Hiện Đại** ✨

- Responsive design - hoạt động tốt trên mobile & desktop
- Animations mượt mà, UX thân thiện
- Lịch sử chat được lưu trữ tự động
- Emoji & icons giúp dễ hiểu hơn

### 5. **Xử Lý Yêu Cầu Đặc Biệt** 🎯

- Nhận yêu cầu dặc biệt từ khách hàng
- Ghi nhận thông tin liên hệ
- Hỗ trợ hotline, email, chat live 24/7

## 🚀 Cách Sử Dụng

### Bước 1: Mở Chatbox

Nhấp vào nút **"Chat AI"** ở góc phải dưới màn hình

### Bước 2: Chọn Tính Năng

- **🔍 Tìm phòng**: Lọc phòng theo tiêu chí
- **📋 Đặt ngay**: Đặt phòng cụ thể
- **✨ Tiện nghi**: Hỏi về dịch vụ
- **🎉 Khuyến mại**: Xem ưu đãi hiện tại
- **📞 Liên hệ**: Thông tin hỗ trợ

### Bước 3: Tư Vấn Tự Nhiên

Bạn cũng có thể **nhắn tin tự do**:

- "Tôi cần phòng cho 4 người"
- "Có phòng sea view không?"
- "Giá bao nhiêu cho weekend?"
- "Đặt phòng deluxe ngay"

## 🎯 Ví Dụ Cụ Thể

### Tình Huống 1: Tìm Phòng Gia Đình

1. Nhấn "🔍 Tìm phòng"
2. Chọn:
   - Nhận phòng: 25/12/2024
   - Trả phòng: 27/12/2024
   - Người lớn: 2
   - Trẻ em: 2
3. Nhấn "🔍 Tìm phòng"
4. Xem danh sách phòng phù hợp

### Tình Huống 2: Đặt Phòng Ngay

1. Nhấn "📋 Đặt ngay"
2. Nhập "Family" hoặc chọn từ gợi ý
3. Điền thông tin:
   - Tên đầy đủ
   - Email
   - Số điện thoại (tùy chọn)
   - Yêu cầu đặc biệt (tùy chọn)
4. Nhấn "Xác nhận đặt phòng"
5. Nhận mã xác nhận

### Tình Huống 3: Hỏi Về Khuyến Mại

1. Nhắn: "Có khuyến mại gì không?"
2. AI sẽ liệt kê:
   - Giảm 15% đặt 3+ đêm
   - Nâng cấp phòng miễn phí
   - Voucher ăn sáng
   - Và nhiều hơn nữa...

## 💾 Lưu Trữ Dữ Liệu

- **Lịch sử chat**: Tự động lưu trên browser
- **Thông tin tài khoản**: Dùng user.id để lưu riêng cho mỗi người
- **Đặt phòng**: Lưu vào RoomContext & database

## 🔧 Tùy Chỉnh & Mở Rộng

### Thêm Phản Hồi AI Mới

Chỉnh sửa `AI_RESPONSES` trong file:

```jsx
const AI_RESPONSES = {
  greetings: [...],
  new_category: [
    'Phản hồi 1',
    'Phản hồi 2'
  ]
};
```

### Tích Hợp AI API (ChatGPT, Gemini, Claude)

```jsx
const getAIResponse = async (userMessage) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  return response.data.choices[0].message.content;
};
```

### Thêm Webhook Notification

```jsx
const notifyBooking = async (booking) => {
  await fetch("/api/notify", {
    method: "POST",
    body: JSON.stringify(booking),
  });
};
```

## 📊 Thống Kê & Analytics

Để theo dõi hiệu suất chatbox:

- Số lần mở: `message.length > 1`
- Tỷ lệ đặt phòng: `bookings_created / total_conversations`
- Lệnh phổ biến nhất: Phân tích `extractIntent()`
- Thời gian tương tác trung bình

## 🎨 Cải Thiện Giao Diện

### Themes Có Sẵn

- Dark mode (tuỳ chọn Tailwind)
- Light mode (mặc định)
- Custom colors (điều chỉnh `bg-blue-600`)

### Animations

- `animate-fade-in`: Xuất hiện mượt mà
- `animate-bounce`: Nút Chat bật nhấp
- `animate-slide-up`: Mở chatbox từ dưới lên
- `hover:scale-105`: Phóng to khi hover

## 🐛 Troubleshooting

| Vấn Đề                 | Giải Pháp                                      |
| ---------------------- | ---------------------------------------------- |
| Không lưu lịch sử chat | Kiểm tra localStorage trong DevTools           |
| Không tìm thấy phòng   | Thêm phòng vào RoomContext trước               |
| Lỗi gửi email          | Kiểm tra emailService.js & cấu hình API        |
| Icons không hiển thị   | Cài đặt react-icons: `npm install react-icons` |

## 📚 File Liên Quan

- `ChatBox.jsx` - Component chính
- `aiAssistant.js` - Utility functions cho AI
- `RoomContext.jsx` - Context quản lý phòng
- `AuthContext.jsx` - Context xác thực người dùng

## 🌟 Best Practices

1. **Mô tả rõ ràng**: Người dùng càng cụ thể, AI càng tư vấn tốt
2. **Kiểm tra email**: Luôn xác minh email trước khi đặt phòng
3. **Xử lý lỗi**: Thêm validation cho tất cả input
4. **Phản hồi nhanh**: Giữ typing delay dưới 1 giây
5. **Cập nhật thường xuyên**: Refresh AI_RESPONSES theo mùa/khuyến mại

## 📞 Liên Hệ & Hỗ Trợ

- **Hotline**: 1-800-HOTEL
- **Email**: support@hotel.com
- **Chat Live**: 24/7 trong ứng dụng
- **Website**: hotel.com

---

**Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi! 🙏**
