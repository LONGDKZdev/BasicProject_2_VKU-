/**
 * ChatBox Configuration & Customization Examples
 * Bạn có thể copy những ví dụ này vào ChatBox.jsx để tùy chỉnh
 */

// ============================================
// 1. THÊM THÊM QUICK ACTIONS
// ============================================

const EXTENDED_QUICK_ACTIONS = [
  { label: "🔍 Find Room", type: "filter", icon: "🔍" },
  { label: "📋 Book Now", type: "book", icon: "📋" },
  { label: "✨ Amenities", type: "amenities", icon: "✨" },
  { label: "🎉 Promotions", type: "promo", icon: "🎉" },
  { label: "📞 Contact", type: "contact", icon: "📞" },
  // Add new action
  { label: "💳 Payment", type: "payment", icon: "💳" },
  { label: "⭐ Reviews", type: "reviews", icon: "⭐" },
  { label: "🎁 Loyalty", type: "loyalty", icon: "🎁" },
];

// ============================================
// 2. CUSTOM AI RESPONSES
// ============================================

const CUSTOM_AI_RESPONSES = {
  greetings: [
    "Hello! 👋 I'm the assistant of a 5-star hotel. How can I help you?",
    "Welcome to our hotel! 🏨 What can I do for you today?",
    "Hi! 😊 I'm here to make your day great!",
  ],
  payment: [
    "💳 We accept: Visa, Mastercard, Apple Pay, Google Pay",
    "💰 100% secure payment with SSL encryption",
    "✅ You can pay online or at the front desk",
  ],
  loyalty: [
    "⭐ VIP Program: Each booking = 10 points\n100 points = 20% Discount",
    "🎁 Members get:\n• Free room upgrade\n• Breakfast voucher\n• Priority support",
  ],
  reviews: [
    "⭐⭐⭐⭐⭐ 4.8/5 stars from 2000+ reviews",
    '"Great room, friendly staff!" - Maria',
    '"I will come back!" - John',
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
  pool: "🏊 Olympic Pool (open 6AM-10PM)",
  gym: "🏋️ Modern Gym (24/7)",
  spa: "🧖 Spa & Massage (10AM-11PM)",
  restaurant: "🍽️ 5-Star Restaurant (6AM-12AM)",
  bar: "🍸 Bar & Lounge (5PM-2AM)",
  parking: "🅿️ Free Parking",
  wifi: "📶 Free WiFi (300 Mbps)",
  transfer: "🚗 Airport Transfer Service",
  concierge: "🎩 Concierge 24/7",
  laundry: "👕 Laundry Service (next day)",
};

// ============================================
// 5. MESSAGE TEMPLATES
// ============================================

export const MESSAGE_TEMPLATES = {
  welcome: (userName) => `Hello ${userName}! 👋 Welcome back!`,

  roomSuggestion: (room, nights, totalPrice) =>
    `🏨 ${room.name}\n📅 ${nights} nights\n💰 $${totalPrice} (${room.price}/night)`,

  bookingConfirmed: (code, roomName, checkIn, checkOut) =>
    `🎉 Confirmation successful!\nCode: ${code}\nRoom: ${roomName}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}`,

  specialRequest: (request) =>
    `📝 Request: ${request}\nWe will process ASAP!`,

  promotionAlert: (discount) =>
    `🎉 HOT Deal!\n${discount}% off for bookings today!`,
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
    message: "Name must be 2-100 characters, letters only",
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email address",
  },
  phone: {
    required: false,
    pattern: /^(\+84|0)[0-9]{9,10}$/,
    message: "Vietnamese phone number",
  },
  adults: {
    required: true,
    min: 1,
    max: 10,
    message: "1-10 adults",
  },
  kids: {
    required: true,
    min: 0,
    max: 10,
    message: "0-10 children",
  },
};

// ============================================
// 7. CONVERSATION FLOWS
// ============================================

export const CONVERSATION_FLOWS = {
  newUser: [
    "Hello! Is this your first time booking?",
    "Do you want to find a room or have questions?",
  ],
  returningUser: ["Welcome back!", "Which room would you like to book this time?"],
  lastMinute: ["⚡ Book within 24h: 20% off!", "Rooms available today?"],
  groupBooking: [
    "Groups of 10+ people: 30% off",
    "Contact: group@hotel.com or +84123456789",
  ],
};

// ============================================
// 8. ERROR MESSAGES (TIẾNG VIỆT)
// ============================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "❌ Connection error. Please check your internet!",
  BOOKING_FAILED: "❌ Unable to create booking. Try again?",
  INVALID_INPUT: "❌ Invalid information. Please check!",
  ROOM_UNAVAILABLE: "❌ Room is not available for these dates.",
  PAYMENT_FAILED: "❌ Payment failed. Try another method?",
  SERVER_ERROR: "❌ Server error. Please try again later!",
  TOO_MANY_REQUESTS: "⏱️ Too many requests. Wait 1 minute and try again!",
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
