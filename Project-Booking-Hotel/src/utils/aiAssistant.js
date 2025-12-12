/**
 * AI Assistant utilities for hotel booking chatbot
 */

// Intelligent room recommendations based on user preferences
export const recommendRooms = (rooms, preferences) => {
  const { adults, kids, budget, amenities = [] } = preferences;

  const filtered = rooms.filter((room) => {
    const totalGuests = adults + kids;
    if (room.maxPerson < totalGuests) return false;
    if (budget && room.price > budget) return false;
    if (amenities.length > 0) {
      const roomAmenities = room.amenities?.map((a) => a.toLowerCase()) || [];
      return amenities.some((a) => roomAmenities.includes(a.toLowerCase()));
    }
    return true;
  });

  return filtered
    .sort((a, b) => {
      // Prioritize rooms that fit perfectly
      const aScore = a.maxPerson - (adults + kids);
      const bScore = b.maxPerson - (adults + kids);
      return aScore - bScore;
    })
    .slice(0, 5);
};

// Calculate stay duration and price
export const calculateStayInfo = (checkIn, checkOut) => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const nights = Math.max(
    1,
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  );
  return { nights, startDate, endDate };
};

// Get dynamic pricing based on dates (weekday/weekend/holiday)
export const getDynamicPrice = (basePrice, date) => {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

  if (isWeekend) {
    return Math.round(basePrice * 1.3); // 30% more on weekends
  }
  return basePrice;
};

// Validate booking information
export const validateBooking = (bookingData) => {
  const errors = [];

  if (!bookingData.name?.trim()) errors.push("Name cannot be empty");
  if (!bookingData.email?.trim() || !bookingData.email.includes("@"))
    errors.push("Invalid email address");
  if (bookingData.checkIn >= bookingData.checkOut)
    errors.push("Check-out date must be after check-in date");
  if (!bookingData.roomName?.trim()) errors.push("Please select a room");

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Format booking confirmation
export const formatConfirmation = (booking, room) => {
  const { nights } = calculateStayInfo(booking.checkIn, booking.checkOut);
  const totalPrice = room.price * nights;

  return {
    confirmationCode: booking.confirmationCode,
    room: room.name,
    guest: booking.name,
    checkIn: new Date(booking.checkIn).toLocaleDateString("en-US"),
    checkOut: new Date(booking.checkOut).toLocaleDateString("en-US"),
    nights,
    pricePerNight: room.price,
    totalPrice,
    adults: booking.adults,
    kids: booking.kids,
    specialRequests: booking.specialRequests,
  };
};

// Get conversation context to provide better recommendations
export const getContextFromChat = (messages) => {
  const context = {
    mentionedAmenities: [],
    budgetRange: null,
    preferredRoomType: null,
    specialNeeds: [],
  };

  messages.forEach((msg) => {
    if (msg.role === "user") {
      const text = msg.text.toLowerCase();

      // Detect amenities
      if (text.includes("pool") || text.includes("swimming"))
        context.mentionedAmenities.push("pool");
      if (text.includes("gym") || text.includes("fitness") || text.includes("workout"))
        context.mentionedAmenities.push("gym");
      if (text.includes("spa") || text.includes("massage"))
        context.mentionedAmenities.push("spa");
      if (text.includes("wifi")) context.mentionedAmenities.push("wifi");

      // Detect room preferences
      if (text.includes("deluxe")) context.preferredRoomType = "deluxe";
      if (text.includes("family"))
        context.preferredRoomType = "family";
      if (text.includes("view") || text.includes("sea view") || text.includes("ocean view"))
        context.preferredRoomType = "view";

      // Detect special needs
      if (text.includes("special") || text.includes("request") || text.includes("need"))
        context.specialNeeds.push(text);
    }
  });

  return context;
};

// Generate personalized greeting based on time
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning! ☀️";
  if (hour < 17) return "Good afternoon! 🌤️";
  if (hour < 21) return "Good evening! 🌆";
  return "Good night! 🌙";
};

// Smart date suggestions
export const getSuggestedDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  return {
    tonight: { checkIn: formatDate(today), checkOut: formatDate(tomorrow) },
    weekend: {
      checkIn: formatDate(nextWeek),
      checkOut: formatDate(
        new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000)
      ),
    },
    nextMonth: {
      checkIn: formatDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)),
      checkOut: formatDate(
        new Date(today.getTime() + 31 * 24 * 60 * 60 * 1000)
      ),
    },
  };
};

// Extract user intent from message
export const extractIntent = (userMessage) => {
  const text = userMessage.toLowerCase();

  const intents = {
    book: ["book", "booking", "reserve", "reservation", "make a booking"],
    search: ["search", "find", "look", "recommend", "suggest", "show me"],
    price: ["price", "cost", "how much", "discount", "promotion", "deal"],
    amenities: ["amenities", "facilities", "features", "what", "services"],
    cancel: ["cancel", "delete", "remove", "cancel booking"],
    modify: ["modify", "update", "change", "edit"],
    contact: ["contact", "support", "help", "hotline", "phone", "email"],
  };

  const detectedIntents = [];
  Object.entries(intents).forEach(([intent, keywords]) => {
    if (keywords.some((kw) => text.includes(kw))) {
      detectedIntents.push(intent);
    }
  });

  return detectedIntents.length > 0 ? detectedIntents[0] : "general";
};

// Generate helpful suggestions based on context
export const generateSuggestions = (userContext, stage) => {
  const suggestions = [];

  if (stage === "idle") {
    suggestions.push("💎 Deluxe Room - Luxurious with stunning views");
    suggestions.push("👨‍👩‍👧‍👦 Family Room - Spacious for families");
    suggestions.push("🏖️ Sea View Room - Ultimate relaxation");
  }

  if (stage === "filter" && userContext.mentionedAmenities.length > 0) {
    suggestions.push(`✓ Features ${userContext.mentionedAmenities.join(", ")}`);
  }

  return suggestions;
};

export default {
  recommendRooms,
  calculateStayInfo,
  getDynamicPrice,
  validateBooking,
  formatConfirmation,
  getContextFromChat,
  getTimeBasedGreeting,
  getSuggestedDates,
  extractIntent,
  generateSuggestions,
};
