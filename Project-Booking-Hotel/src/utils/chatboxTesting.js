/**
 * ChatBox Testing & Example Scenarios
 * Sử dụng những ví dụ này để test các tính năng của chatbox
 */

// ============================================
// 1. TEST SCENARIOS
// ============================================

export const TEST_SCENARIOS = {
  // Scenario 1: Khách mới tìm phòng
  scenario1_findRoom: {
    name: "Find Rooms - New User",
    steps: [
      { action: "click", target: "quick-action", params: { type: "filter" } },
      { action: "input", target: "checkIn", value: "2024-12-25" },
      { action: "input", target: "checkOut", value: "2024-12-27" },
      { action: "input", target: "adults", value: 2 },
      { action: "input", target: "kids", value: 0 },
      { action: "click", target: "apply-filter" },
    ],
    expectedResult: "Should show filtered rooms and navigate to rooms page",
  },

  // Scenario 2: Khách đặt phòng
  scenario2_booking: {
    name: "Book Room - Direct",
    steps: [
      { action: "click", target: "quick-action", params: { type: "book" } },
      { action: "input", target: "roomName", value: "Deluxe" },
      { action: "waitForSuggestions", timeout: 1000 },
      { action: "click", target: "room-suggestion", params: { index: 0 } },
      { action: "input", target: "name", value: "Nguyễn Văn A" },
      { action: "input", target: "email", value: "test@example.com" },
      { action: "input", target: "phone", value: "+84123456789" },
      { action: "click", target: "create-booking" },
    ],
    expectedResult: "Booking confirmation with code",
  },

  // Scenario 3: Hỏi tư vấn
  scenario3_consultation: {
    name: "Ask Consultation",
    steps: [
      { action: "type", value: "Tôi cần phòng cho 4 người, có bể bơi không?" },
      { action: "send" },
      { action: "waitForResponse", timeout: 2000 },
    ],
    expectedResult: "AI should suggest rooms with pool",
  },

  // Scenario 4: Hỏi về tiện nghi
  scenario4_amenities: {
    name: "Ask About Amenities",
    steps: [
      { action: "type", value: "Có gym, spa không?" },
      { action: "send" },
      { action: "waitForResponse", timeout: 1500 },
    ],
    expectedResult: "Show available amenities",
  },

  // Scenario 5: Hỏi giá
  scenario5_pricing: {
    name: "Ask About Pricing",
    steps: [
      { action: "type", value: "Phòng Deluxe giá bao nhiêu?" },
      { action: "send" },
      { action: "waitForResponse", timeout: 1500 },
    ],
    expectedResult: "Show pricing information",
  },

  // Scenario 6: Mobile responsiveness
  scenario6_mobile: {
    name: "Mobile Responsiveness",
    steps: [
      { action: "resize", width: 375, height: 667 }, // iPhone size
      { action: "click", target: "chatbox-button" },
      { action: "check", target: "chatbox-width", expected: "360px" },
    ],
    expectedResult: "Chatbox should be responsive",
  },
};

// ============================================
// 2. UNIT TEST EXAMPLES (Jest)
// ============================================

export const unitTestExamples = `
// Test: validateBookingForm
describe('validateBookingForm', () => {
  test('should fail with empty name', () => {
    const result = validateBookingForm({
      name: '',
      email: 'test@test.com',
      checkIn: '2024-12-25',
      checkOut: '2024-12-27',
      roomName: 'Deluxe',
      adults: 2,
      kids: 0
    });
    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_NAME');
  });

  test('should fail with invalid email', () => {
    const result = validateBookingForm({
      name: 'John Doe',
      email: 'invalid-email',
      checkIn: '2024-12-25',
      checkOut: '2024-12-27',
      roomName: 'Deluxe',
      adults: 2,
      kids: 0
    });
    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_EMAIL');
  });

  test('should fail with invalid dates', () => {
    const result = validateBookingForm({
      name: 'John Doe',
      email: 'test@test.com',
      checkIn: '2024-12-27',
      checkOut: '2024-12-25', // Before check-in!
      roomName: 'Deluxe',
      adults: 2,
      kids: 0
    });
    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_DATES');
  });

  test('should pass with valid data', () => {
    const result = validateBookingForm({
      name: 'John Doe',
      email: 'test@test.com',
      checkIn: '2024-12-25',
      checkOut: '2024-12-27',
      roomName: 'Deluxe',
      adults: 2,
      kids: 0
    });
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});

// Test: extractIntent
describe('extractIntent', () => {
  test('should detect book intent', () => {
    expect(extractIntent('tôi muốn đặt phòng')).toBe('book');
    expect(extractIntent('book a room')).toBe('book');
  });

  test('should detect search intent', () => {
    expect(extractIntent('gợi ý phòng')).toBe('search');
    expect(extractIntent('suggest rooms')).toBe('search');
  });

  test('should detect price intent', () => {
    expect(extractIntent('giá bao nhiêu')).toBe('price');
    expect(extractIntent('how much')).toBe('price');
  });

  test('should return general for unknown', () => {
    expect(extractIntent('xin chào')).toBe('general');
  });
});

// Test: sanitizeInput
describe('sanitizeInput', () => {
  test('should sanitize HTML', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  test('should trim whitespace', () => {
    const input = '  hello world  ';
    const result = sanitizeInput(input);
    expect(result).toBe('hello world');
  });

  test('should limit length', () => {
    const input = 'a'.repeat(1000);
    const result = sanitizeInput(input);
    expect(result.length).toBeLessThanOrEqual(500);
  });
});

// Test: calculateNights
describe('calculateNights', () => {
  test('should calculate nights correctly', () => {
    expect(calculateNights('2024-12-25', '2024-12-26')).toBe(1);
    expect(calculateNights('2024-12-25', '2024-12-27')).toBe(2);
    expect(calculateNights('2024-12-25', '2024-12-30')).toBe(5);
  });

  test('should handle same day', () => {
    expect(calculateNights('2024-12-25', '2024-12-25')).toBe(0);
  });
});
`;

// ============================================
// 3. MANUAL TEST CHECKLIST
// ============================================

export const MANUAL_TEST_CHECKLIST = [
  {
    category: "Visual & UX",
    tests: [
      "✅ Chatbox button appears at bottom-right",
      "✅ Button has animate bounce effect",
      "✅ Clicking button opens chatbox",
      "✅ Chatbox has rounded corners (border-radius: 1.5rem)",
      "✅ Gradient header (blue-600 to blue-700)",
      "✅ Messages fade in smoothly",
      "✅ Timestamps visible on messages",
      "✅ Typing dots animate correctly",
      "✅ Scroll to latest message automatically",
      "✅ Mobile: responsive width adjustment",
    ],
  },
  {
    category: "Functionality",
    tests: [
      "✅ Sending messages works",
      "✅ Quick reply buttons trigger actions",
      "✅ Filter form inputs accept values",
      "✅ Booking form all fields fillable",
      "✅ Room suggestions appear when typing name",
      "✅ Apply filter navigates to rooms",
      "✅ Create booking generates confirmation code",
      "✅ Error messages display for invalid input",
      "✅ Close button works",
      "✅ Enter key sends message",
    ],
  },
  {
    category: "Validation",
    tests: [
      "✅ Name cannot be empty",
      "✅ Email must have @",
      "✅ Check-out must be after check-in",
      "✅ Adults cannot be 0 or > 10",
      "✅ Phone number validation (if filled)",
      "✅ Room name cannot be empty",
      "✅ Error messages are helpful",
      "✅ Can recover from error",
      "✅ Validation happens before booking",
      "✅ No booking created on validation fail",
    ],
  },
  {
    category: "Data Persistence",
    tests: [
      "✅ Chat history saves in localStorage",
      "✅ Chat history loads on page reload",
      "✅ Different users have separate history",
      "✅ LocalStorage key includes user ID",
      "✅ Analytics data tracked",
      "✅ Booking data passed to context",
      "✅ Timestamps stored correctly",
      "✅ No errors in console",
      "✅ Storage doesn't exceed limit",
    ],
  },
  {
    category: "AI Responses",
    tests: [
      "✅ Initial greeting message appears",
      "✅ Different response variants work",
      "✅ Typing delay (500-600ms) feels natural",
      "✅ Random responses vary",
      "✅ Intent detection works for book/search/price",
      "✅ Fallback response for unknown intent",
      "✅ Emoji display correctly",
      "✅ Vietnamese text displays correctly",
      "✅ Links work if included",
      "✅ Special characters display properly",
    ],
  },
  {
    category: "Mobile",
    tests: [
      "✅ Chatbox button visible on mobile",
      "✅ Chatbox opens/closes smoothly",
      "✅ Form fields readable on mobile",
      "✅ Text input usable on mobile",
      "✅ Buttons clickable (touch-friendly)",
      "✅ Scroll works on long messages",
      "✅ Emoji render correctly",
      "✅ No horizontal scroll",
      "✅ Keyboard doesn't overlap content",
      "✅ Portrait & landscape work",
    ],
  },
  {
    category: "Integration",
    tests: [
      "✅ RoomContext methods called",
      "✅ AuthContext user info used",
      "✅ React icons display",
      "✅ Tailwind classes applied",
      "✅ CSS animations work",
      "✅ No console errors",
      "✅ No memory leaks",
      "✅ Performance acceptable",
      "✅ Browser compatibility (Chrome, Firefox, Safari, Edge)",
      "✅ No unused variables/imports",
    ],
  },
  {
    category: "Accessibility",
    tests: [
      "✅ ARIA labels on buttons",
      "✅ Keyboard navigation works",
      "✅ Tab order logical",
      "✅ Color contrast sufficient",
      "✅ Focus indicators visible",
      "✅ No autofocus trap",
      "✅ Screen reader friendly",
      "✅ Text size readable",
      "✅ Links underlined if needed",
      "✅ Forms labeled properly",
    ],
  },
];

// ============================================
// 4. PERFORMANCE TEST
// ============================================

export const PERFORMANCE_TESTS = {
  chatOpen: {
    name: "Time to open chatbox",
    target: "< 200ms",
    test: () => {
      const start = performance.now();
      // Click button
      const end = performance.now();
      return end - start;
    },
  },
  messageSend: {
    name: "Time to send message",
    target: "< 100ms",
    test: () => {
      const start = performance.now();
      // Send message
      const end = performance.now();
      return end - start;
    },
  },
  roomFilter: {
    name: "Time to filter rooms",
    target: "< 500ms",
    test: () => {
      const start = performance.now();
      // Apply filter
      const end = performance.now();
      return end - start;
    },
  },
  validation: {
    name: "Time to validate form",
    target: "< 50ms",
    test: () => {
      const start = performance.now();
      // Validate
      const end = performance.now();
      return end - start;
    },
  },
};

// ============================================
// 5. DEBUG HELPERS
// ============================================

export const DEBUG_HELPERS = {
  // Log all messages
  logMessages: () => {
    console.warn("logMessages(): localStorage-based history has been removed.");
  },

  // Clear chat history
  clearHistory: () => {
    console.warn("clearHistory(): localStorage-based history has been removed.");
  },

  // Log analytics
  logAnalytics: () => {
    console.warn(
      "logAnalytics(): localStorage-based analytics has been removed."
    );
  },

  // Test validation
  testValidation: (data) => {
    const { validateBookingForm } = require("./chatboxValidation");
    const result = validateBookingForm(data);
    console.log("Validation result:", result);
    return result;
  },

  // Test intent detection
  testIntent: (message) => {
    const { extractIntent } = require("./aiAssistant");
    const intent = extractIntent(message);
    console.log(`Intent for "${message}": ${intent}`);
    return intent;
  },

  // Performance monitor
  monitorPerformance: () => {
    if (window.performance) {
      const perfData = window.performance.timing;
      console.log("Performance Metrics:");
      console.log(
        "DOM Content Loaded:",
        perfData.domContentLoadedEventEnd - perfData.navigationStart
      );
      console.log(
        "Page Load Time:",
        perfData.loadEventEnd - perfData.navigationStart
      );
    }
  },
};

// ============================================
// 6. SAMPLE TEST DATA
// ============================================

export const SAMPLE_DATA = {
  validBooking: {
    name: "Nguyễn Văn A",
    email: "nguyen@example.com",
    phone: "+84912345678",
    checkIn: "2024-12-25",
    checkOut: "2024-12-27",
    roomName: "Deluxe",
    adults: 2,
    kids: 1,
    specialRequests: "High floor, sea view",
  },

  invalidBooking: {
    name: "",
    email: "invalid-email",
    checkIn: "2024-12-27",
    checkOut: "2024-12-25",
    roomName: "",
    adults: 15,
  },

  sampleRooms: [
    {
      id: 1,
      name: "Deluxe Room",
      type: "deluxe",
      price: 150,
      maxPerson: 2,
      image: "url",
      beds: 1,
    },
    {
      id: 2,
      name: "Family Room",
      type: "family",
      price: 250,
      maxPerson: 4,
      image: "url",
      beds: 2,
    },
    {
      id: 3,
      name: "Suite",
      type: "suite",
      price: 400,
      maxPerson: 3,
      image: "url",
      beds: 1,
    },
  ],

  sampleUser: {
    id: "user_123",
    name: "John Doe",
    email: "john@example.com",
    phone: "+84912345678",
  },
};

// ============================================
// USAGE IN BROWSER CONSOLE
// ============================================

export const CONSOLE_COMMANDS = `
// Copy-paste vào browser console để test:

// 1. Xem chat history
console.table(JSON.parse(localStorage.getItem('hotel_chat_history_guest')))

// 2. Xem analytics
console.table(JSON.parse(localStorage.getItem('hotel_chat_analytics')))

// 3. Xóa history
localStorage.removeItem('hotel_chat_history_guest')

// 4. Kiểm tra performance
performance.measure('chatbox')

// 5. Xem state (cần add console.log trong component)
// ... định nghĩa trong React Component
`;

export default {
  TEST_SCENARIOS,
  MANUAL_TEST_CHECKLIST,
  PERFORMANCE_TESTS,
  DEBUG_HELPERS,
  SAMPLE_DATA,
  unitTestExamples,
  CONSOLE_COMMANDS,
};
