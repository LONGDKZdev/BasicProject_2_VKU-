/**
 * ChatBox Configuration & Customization Examples
 * Bạn có thể copy những ví dụ này vào ChatBox.jsx để tùy chỉnh
 */

// ============================================
// 1. THÊM THÊM QUICK ACTIONS
// ============================================

const EXTENDED_QUICK_ACTIONS = [
  { label: "🔍 Tìm phòng", type: "filter", icon: "🔍" },
  { label: "📋 Đặt ngay", type: "book", icon: "📋" },
  { label: "✨ Tiện nghi", type: "amenities", icon: "✨" },
  { label: "🎉 Khuyến mại", type: "promo", icon: "🎉" },
  { label: "📞 Liên hệ", type: "contact", icon: "📞" },
  // Thêm action mới
  { label: "💳 Thanh toán", type: "payment", icon: "💳" },
  { label: "⭐ Reviews", type: "reviews", icon: "⭐" },
  { label: "🎁 Loyalty", type: "loyalty", icon: "🎁" },
];

// ============================================
// 2. CUSTOM AI RESPONSES
// ============================================

const CUSTOM_AI_RESPONSES = {
  greetings: [
    "Xin chào! 👋 Tôi là trợ lý của khách sạn 5 sao. Tôi có thể giúp gì cho bạn?",
    "Chào mừng đến khách sạn của chúng tôi! 🏨 Bạn có nhu cầu gì hôm nay?",
    "Hi! 😊 Tôi ở đây để làm cho ngày của bạn trở nên tuyệt vời!",
  ],
  payment: [
    "💳 Chúng tôi chấp nhận: Thẻ Visa, Mastercard, Apple Pay, Google Pay",
    "💰 Thanh toán an toàn 100% với SSL encryption",
    "✅ Bạn có thể thanh toán online hoặc tại quầy",
  ],
  loyalty: [
    "⭐ Chương trình VIP: Mỗi đặt phòng = 10 điểm\n100 điểm = Discount 20%",
    "🎁 Thành viên được:\n• Nâng cấp phòng miễn phí\n• Breakfast voucher\n• Priority support",
  ],
  reviews: [
    "⭐⭐⭐⭐⭐ 4.8/5 sao từ 2000+ reviews",
    '"Phòng tuyệt vời, nhân viên thân thiện!" - Maria',
    '"Tôi sẽ quay lại!" - John',
  ],
};

// ============================================
// 3. DYNAMIC PRICING EXAMPLES
// ============================================

export const PRICING_RULES = {
  weekday: 1.0, // Thứ 2-4: Giá cơ bản
  friday: 1.15, // Thứ 5: +15%
  weekend: 1.3, // Thứ 6-7: +30%
  holiday: 1.5, // Ngày lễ: +50%
  peakSeason: 1.4, // Cao điểm: +40%
  lowSeason: 0.8, // Thấp điểm: -20%
};

export const HOLIDAY_DATES = [
  "2024-12-25", // Giáng sinh
  "2024-12-31", // Tết
  "2025-01-01", // Năm mới
  "2025-02-10", // Tết Nguyên Đán
  "2025-04-30", // Ngày Giải phóng
  "2025-09-02", // Quốc khánh
];

// ============================================
// 4. ROOM AMENITIES CONFIGURATION
// ============================================

export const ROOM_AMENITIES = {
  standard: ["WiFi", "AC", "TV"],
  deluxe: ["WiFi", "AC", "TV", "Mini Bar", "Bathrobe"],
  suite: ["WiFi", "AC", "TV", "Mini Bar", "Bathrobe", "Hot Tub", "Living Room"],
  family: ["WiFi", "AC", "TV", "Kids Amenities", "Kitchen", "Living Room"],
  vip: ["All amenities", "Butler service", "Premium toiletries", "Champagne"],
};

export const HOTEL_SERVICES = {
  pool: "🏊 Bể bơi Olympic (open 6AM-10PM)",
  gym: "🏋️ Phòng tập hiện đại (24/7)",
  spa: "🧖 Spa & massage (10AM-11PM)",
  restaurant: "🍽️ Nhà hàng 5 sao (6AM-12AM)",
  bar: "🍸 Bar & lounge (5PM-2AM)",
  parking: "🅿️ Bãi đỗ xe miễn phí",
  wifi: "📶 WiFi miễn phí (300 Mbps)",
  transfer: "🚗 Dịch vụ đ接 sân bay",
  concierge: "🎩 Concierge 24/7",
  laundry: "👕 Dịch vụ giặt (next day)",
};

// ============================================
// 5. MESSAGE TEMPLATES
// ============================================

export const MESSAGE_TEMPLATES = {
  welcome: (userName) => `Chào ${userName}! 👋 Chào mừng quay lại!`,

  roomSuggestion: (room, nights, totalPrice) =>
    `🏨 ${room.name}\n📅 ${nights} đêm\n💰 $${totalPrice} (${room.price}/đêm)`,

  bookingConfirmed: (code, roomName, checkIn, checkOut) =>
    `🎉 Xác nhận thành công!\nMã: ${code}\nPhòng: ${roomName}\nNhận: ${checkIn}\nTrara: ${checkOut}`,

  specialRequest: (request) =>
    `📝 Yêu cầu: ${request}\nChúng tôi sẽ xử lý ASAP!`,

  promotionAlert: (discount) =>
    `🎉 Ưu đãi HOT!\nGiảm ${discount}% cho đặt hôm nay!`,
};

// ============================================
// 6. VALIDATION RULES
// ============================================

export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: "Tên phải từ 2-100 ký tự, chỉ chứa chữ cái",
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Email không hợp lệ",
  },
  phone: {
    required: false,
    pattern: /^(\+84|0)[0-9]{9,10}$/,
    message: "Số điện thoại Việt Nam",
  },
  adults: {
    required: true,
    min: 1,
    max: 10,
    message: "Từ 1-10 người lớn",
  },
  kids: {
    required: true,
    min: 0,
    max: 10,
    message: "Từ 0-10 trẻ em",
  },
};

// ============================================
// 7. CONVERSATION FLOWS
// ============================================

export const CONVERSATION_FLOWS = {
  newUser: [
    "Xin chào! Đây là lần đầu bạn đặt phòng?",
    "Bạn muốn tìm phòng hay có câu hỏi?",
  ],
  returningUser: ["Chào mừng bạn quay lại!", "Lần này bạn muốn đặt phòng nào?"],
  lastMinute: ["⚡ Đặt trong 24h: Giảm 20%!", "Phòng còn trống hôm nay?"],
  groupBooking: [
    "Nhóm từ 10 người trở lên: Giảm 30%",
    "Liên hệ: group@hotel.com hoặc +84123456789",
  ],
};

// ============================================
// 8. ERROR MESSAGES (TIẾNG VIỆT)
// ============================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "❌ Lỗi kết nối. Vui lòng kiểm tra internet!",
  BOOKING_FAILED: "❌ Không thể tạo đặt phòng. Thử lại?",
  INVALID_INPUT: "❌ Thông tin không hợp lệ. Vui lòng kiểm tra!",
  ROOM_UNAVAILABLE: "❌ Phòng không còn trống cho ngày này.",
  PAYMENT_FAILED: "❌ Thanh toán thất bại. Thử phương thức khác?",
  SERVER_ERROR: "❌ Lỗi máy chủ. Vui lòng thử lại sau!",
  TOO_MANY_REQUESTS: "⏱️ Quá nhiều yêu cầu. Chờ 1 phút rồi thử lại!",
};

// ============================================
// 9. INTEGRATION EXAMPLES
// ============================================

// Webhook notification
export const notifyBookingEvent = async (event, data) => {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  };

  // Send to backend
  try {
    const response = await fetch("https://your-api.com/webhooks/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  } catch (error) {
    console.error("Webhook failed:", error);
  }
};

// Send email notification
export const sendBookingEmail = async (email, booking) => {
  try {
    const response = await fetch("https://your-api.com/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        template: "booking-confirmation",
        data: booking,
      }),
    });
    return response.json();
  } catch (error) {
    console.error("Email send failed:", error);
  }
};

// SMS notification (optional)
export const sendBookingSMS = async (phone, message) => {
  try {
    const response = await fetch("https://your-sms-api.com/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        message,
      }),
    });
    return response.json();
  } catch (error) {
    console.error("SMS send failed:", error);
  }
};

// ============================================
// 10. CUSTOMIZATION GUIDE
// ============================================

/*
HOW TO USE THESE CONFIGURATIONS:

1. Copy các hàm này vào ChatBox.jsx hoặc utils file
2. Import và sử dụng:

   import { ROOM_AMENITIES, MESSAGE_TEMPLATES } from './config';

3. Ví dụ sử dụng:
   
   // Trong handleSend function:
   if (t.includes('tiện nghi')) {
     const amenitiesText = Object.entries(HOTEL_SERVICES)
       .map(([key, value]) => value)
       .join('\n');
     pushAI(amenitiesText);
   }

4. Tùy chỉnh theo hotel của bạn:
   - Đổi giá cước
   - Thêm dịch vụ mới
   - Thay đổi messages
   - Thêm promotion mới

5. Test toàn bộ flows:
   - New user flow
   - Returning user flow
   - Group booking flow
   - Emergency/support flow
*/

export default {
  EXTENDED_QUICK_ACTIONS,
  CUSTOM_AI_RESPONSES,
  PRICING_RULES,
  HOLIDAY_DATES,
  ROOM_AMENITIES,
  HOTEL_SERVICES,
  MESSAGE_TEMPLATES,
  VALIDATION_RULES,
  CONVERSATION_FLOWS,
  ERROR_MESSAGES,
  notifyBookingEvent,
  sendBookingEmail,
  sendBookingSMS,
};
