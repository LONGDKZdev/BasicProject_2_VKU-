# 🤖 ChatBox AI - Developer Integration Guide

## 📁 Cấu Trúc File

```
src/
├── components/
│   └── chatBox/
│       ├── ChatBox.jsx           # Main component
│       └── index.js
├── utils/
│   ├── aiAssistant.js            # AI logic & recommendations
│   └── chatboxValidation.js       # Validation & error handling
├── style/
│   └── chatbox.css                # Custom animations & styles
└── context/
    ├── RoomContext.jsx            # Quản lý phòng
    └── AuthContext.jsx            # Quản lý người dùng
```

## 🔧 Installation & Setup

### 1. Cài đặt Dependencies

```bash
npm install react-icons  # Đã có trong package.json
```

### 2. Import CSS

File CSS đã được import tự động vào `App.jsx`:

```jsx
import "./style/chatbox.css";
```

### 3. Context Requirements

Chatbox cần có 2 contexts:

- `RoomContext` - Quản lý phòng, đặt phòng
- `AuthContext` - Quản lý người dùng, xác thực

## 🎯 Core Features Implementation

### 1. AI Response System

**Location:** `src/components/chatBox/ChatBox.jsx` (dòng 8-24)

```jsx
const AI_RESPONSES = {
  greetings: [...],
  room_suggestions: [...],
  price_inquiry: [...],
  amenities: [...],
  special_requests: [...]
};
```

**Để thêm phản hồi mới:**

```jsx
const AI_RESPONSES = {
  ...existing,
  new_intent: ["Response option 1", "Response option 2", "Response option 3"],
};

// Sử dụng
const response = getRandomResponse("new_intent");
```

### 2. Intent Detection

**Location:** `src/utils/aiAssistant.js` (dòng 130+)

```jsx
export const extractIntent = (userMessage) => {
  const text = userMessage.toLowerCase();

  const intents = {
    book: ["đặt", "book", "booking"],
    search: ["tìm", "search", "gợi ý"],
    price: ["giá", "price", "bao nhiêu"],
    // Thêm intent mới tại đây
    vip: ["vip", "premium", "cao cấp"],
  };

  const detectedIntents = [];
  Object.entries(intents).forEach(([intent, keywords]) => {
    if (keywords.some((kw) => text.includes(kw))) {
      detectedIntents.push(intent);
    }
  });

  return detectedIntents.length > 0 ? detectedIntents[0] : "general";
};
```

### 3. Room Recommendation Engine

**Location:** `src/utils/aiAssistant.js` (dòng 6-20)

```jsx
export const recommendRooms = (rooms, preferences) => {
  const { adults, kids, budget, amenities = [] } = preferences;

  // Lọc dựa trên tiêu chí
  const filtered = rooms.filter((room) => {
    // Custom logic
    return true;
  });

  // Sắp xếp kết quả
  return filtered.sort((a, b) => a.maxPerson - b.maxPerson);
};
```

## 💾 Data Storage

### Local Storage Keys

```javascript
// Lịch sử chat
localStorage.getItem(`hotel_chat_history_${user?.id || "guest"}`);

// Context cho conversation
localStorage.getItem(`hotel_chat_context_${user?.id || "guest"}`);

// Analytics
localStorage.getItem("hotel_chat_analytics");
```

### Session Data

```jsx
// State được quản lý trong ChatBox component
const [messages, setMessages] = useState([]);
const [filterForm, setFilterForm] = useState({});
const [bookingForm, setBookingForm] = useState({});
const [stage, setStage] = useState("idle"); // idle | filter | book
```

## 🔌 Integration Points

### 1. RoomContext Methods

```jsx
// Cần có các method này từ RoomContext
const {
  setCheckInDate,
  setCheckOutDate,
  setAdults,
  setKids,
  handleCheck, // Trigger room filtering
  allRooms, // Room list
  bookRoom, // Create booking
} = useRoomContext();
```

### 2. AuthContext Methods

```jsx
const {
  user, // Current user info
  isAuthenticated, // Check if logged in
} = useAuth();
```

### 3. Room Object Structure

```javascript
{
  id: 'room_1',
  name: 'Deluxe Room',
  type: 'deluxe',
  price: 150,
  maxPerson: 2,
  beds: 1,
  image: 'url_to_image',
  amenities: ['wifi', 'ac', 'tv'],
  capacity: 2,
  currentGuests: 0,
  // Optional
  beds: 1,
  description: 'Luxurious room...'
}
```

### 4. Booking Object Structure

```javascript
{
  roomId: 'room_1',
  roomName: 'Deluxe Room',
  userId: 'user_123',
  userName: 'John Doe',
  userEmail: 'john@example.com',
  userPhone: '+84123456789',
  checkIn: '2024-12-25',
  checkOut: '2024-12-27',
  adults: 2,
  kids: 0,
  specialRequests: 'High floor, near elevator',
  note: 'Created via AI ChatBox'
}
```

## 🧪 Testing

### Unit Tests Example

```javascript
// Test AI intent detection
import { extractIntent } from "../utils/aiAssistant";

describe("extractIntent", () => {
  it("should detect book intent", () => {
    expect(extractIntent("tôi muốn đặt phòng")).toBe("book");
  });

  it("should detect search intent", () => {
    expect(extractIntent("gợi ý phòng cho tôi")).toBe("search");
  });
});

// Test validation
import { validateBookingForm } from "../utils/chatboxValidation";

describe("validateBookingForm", () => {
  it("should fail with empty name", () => {
    const result = validateBookingForm({ name: "", email: "test@test.com" });
    expect(result.isValid).toBe(false);
  });
});
```

## 🚀 Performance Optimization

### 1. Memoization

```jsx
// Gợi ý phòng được cache
const candidateRooms = useMemo(() => {
  const q = bookingForm.roomName?.toLowerCase()?.trim();
  if (!q) return [];
  return allRooms.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 5);
}, [bookingForm.roomName, allRooms]);
```

### 2. Lazy Loading Messages

```jsx
// Chỉ render visible messages
const visibleMessages = messages.slice(-20); // Last 20 only
```

### 3. Auto-scroll Optimization

```jsx
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};
```

## 🔐 Security Considerations

### 1. Input Sanitization

```jsx
import { sanitizeInput } from "../utils/chatboxValidation";

const userMessage = sanitizeInput(input);
// Ngăn XSS attacks
```

### 2. Email Validation

```jsx
import { isValidEmail } from "../utils/chatboxValidation";

if (!isValidEmail(email)) {
  // Show error
}
```

### 3. Phone Validation

```jsx
import { isValidPhone } from "../utils/chatboxValidation";

if (!isValidPhone(phone)) {
  // Show error (but it's optional)
}
```

## 🌐 API Integration

### Webhook Notifications

```javascript
const notifyBooking = async (booking) => {
  await fetch("https://your-api.com/notify-booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
};
```

### Email Service Integration

```jsx
// Already in project: src/utils/emailService.js
import emailService from "./utils/emailService";

const sendConfirmation = async (booking) => {
  await emailService.send({
    to: booking.email,
    template: "booking-confirmation",
    data: booking,
  });
};
```

## 📊 Analytics & Monitoring

### Log Chat Interactions

```jsx
import { logChatInteraction } from "../utils/chatboxValidation";

// Track important events
logChatInteraction("booking_created", {
  roomId: room.id,
  userId: user?.id,
  timestamp: new Date(),
});
```

### Metrics to Track

- Conversation count
- Booking conversion rate
- Average response time
- Most asked questions
- Drop-off points

## 🎨 Customization

### Change Colors

```jsx
// Header gradient
bg-gradient-to-r from-blue-600 to-blue-700

// Change to:
bg-gradient-to-r from-purple-600 to-purple-700
```

### Change Button Labels

```jsx
<QuickReply label="📋 Đặt ngay" onClick={() => onQuick('book')} />

// Change emoji & text
<QuickReply label="🏨 Reserve Now" onClick={() => onQuick('book')} />
```

### Add New Quick Actions

```jsx
{
  stage === "idle" && (
    <div className="flex flex-wrap gap-2 p-2">
      <QuickReply label="🔍 Tìm phòng" onClick={() => onQuick("filter")} />
      <QuickReply label="📋 Đặt ngay" onClick={() => onQuick("book")} />
      {/* Thêm action mới */}
      <QuickReply
        label="🎁 Loyalty Program"
        onClick={() => onQuick("loyalty")}
      />
    </div>
  );
}
```

## 🐛 Common Issues & Solutions

| Issue                       | Cause                       | Solution                                       |
| --------------------------- | --------------------------- | ---------------------------------------------- |
| Chatbox không hiển thị      | CSS chưa import             | Kiểm tra `src/App.jsx` có import `chatbox.css` |
| React-icons không hoạt động | Package chưa install        | `npm install react-icons`                      |
| RoomContext undefined       | Context chưa wrap component | Đảm bảo App bị wrap bởi RoomContextProvider    |
| Lỗi email validation        | Invalid regex               | Kiểm tra `isValidEmail` trong validation file  |
| Messages không lưu          | LocalStorage bị disable     | Kiểm tra browser settings & console errors     |

## 📚 Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com)
- [React Icons](https://react-icons.github.io/react-icons/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## 🤝 Contributing

Khi thêm tính năng mới:

1. Cập nhật documentation
2. Thêm unit tests
3. Kiểm tra performance
4. Ensure backward compatibility
5. Test trên mobile & desktop

## 📝 Version History

- **v1.0** (2024-11-21)
  - Initial AI ChatBox implementation
  - Room filtering & booking
  - Chat history persistence
  - Multilingual support (Vietnamese)
  - Responsive design

---

**Last Updated:** 2024-11-21
**Maintained by:** Hotel Booking Team
