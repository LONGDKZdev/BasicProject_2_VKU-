/**
 * Validation & Error Handling for ChatBox
 */

export const BookingErrors = {
  INVALID_NAME: {
    code: "INVALID_NAME",
    message: "❌ Please enter your full name",
    vietnamese: "Tên không được để trống",
  },
  INVALID_EMAIL: {
    code: "INVALID_EMAIL",
    message: "❌ Invalid email address",
    vietnamese: "Email phải chứa @ và có định dạng đúng",
  },
  INVALID_DATES: {
    code: "INVALID_DATES",
    message: "❌ Check-out date must be after check-in date",
    vietnamese: "Vui lòng kiểm tra lại ngày",
  },
  NO_ROOM: {
    code: "NO_ROOM",
    message: "❌ No matching room found",
    vietnamese: "Thử từ khóa khác hoặc xem tất cả phòng",
  },
  ROOM_FULL: {
    code: "ROOM_FULL",
    message: "❌ This room is full for the selected dates",
    vietnamese: "Vui lòng chọn ngày khác hoặc phòng khác",
  },
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "❌ Error creating booking",
    vietnamese: "Vui lòng thử lại sau",
  },
};

/**
 * Validate booking form data
 */
export const validateBookingForm = (formData) => {
  const errors = [];

  // Validate name
  if (!formData.name || !formData.name.trim()) {
    errors.push(BookingErrors.INVALID_NAME);
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.push(BookingErrors.INVALID_EMAIL);
  }

  // Validate dates
  if (formData.checkIn && formData.checkOut) {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      errors.push({
        code: "INVALID_DATE_FORMAT",
        message: "❌ Invalid date format",
        vietnamese: "Định dạng ngày không hợp lệ",
      });
    } else if (checkInDate >= checkOutDate) {
      errors.push(BookingErrors.INVALID_DATES);
    }
  } else {
    errors.push(BookingErrors.INVALID_DATES);
  }

  // Validate room name
  if (!formData.roomName || !formData.roomName.trim()) {
    errors.push(BookingErrors.NO_ROOM);
  }

  // Validate adults
  if (formData.adults < 1 || formData.adults > 10) {
    errors.push({
      code: "INVALID_ADULTS",
      message: "❌ Number of adults must be between 1-10",
      vietnamese: "Vui lòng nhập lại số người",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate filter form data
 */
export const validateFilterForm = (formData) => {
  const errors = [];

  if (formData.checkIn && formData.checkOut) {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      errors.push({
        code: "INVALID_DATE_FORMAT",
        message: "❌ Invalid date format",
        vietnamese: "Định dạng ngày không hợp lệ",
      });
    } else if (checkInDate >= checkOutDate) {
      errors.push(BookingErrors.INVALID_DATES);
    }
  } else {
    errors.push(BookingErrors.INVALID_DATES);
  }

  if (formData.adults < 1) {
    errors.push({
      code: "INVALID_FILTER",
      message: "❌ At least 1 adult required",
      vietnamese: "Vui lòng nhập lại thông tin",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim()
    .substring(0, 500); // Limit to 500 chars
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error) => {
  if (typeof error === "string") {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  return "❌ An error occurred. Please try again!";
};

/**
 * Check if email is valid
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Check if phone is valid (Vietnamese format)
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field
  const regex = /^(\+84|0)[0-9]{9,10}$/;
  return regex.test(phone.replace(/\s/g, ""));
};

/**
 * Format date for display
 */
export const formatDateDisplay = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

/**
 * Calculate number of nights
 */
export const calculateNights = (checkIn, checkOut) => {
  try {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, nights);
  } catch {
    return 1;
  }
};

/**
 * Calculate total price
 */
export const calculateTotalPrice = (pricePerNight, nights, extras = []) => {
  let total = pricePerNight * nights;

  // Add extra fees
  extras.forEach((extra) => {
    if (extra.percentage) {
      total += total * (extra.amount / 100);
    } else {
      total += extra.amount;
    }
  });

  return Math.round(total * 100) / 100;
};

/**
 * Check room availability
 */
export const checkRoomAvailability = (
  room,
  checkIn,
  checkOut,
  existingBookings = []
) => {
  if (!room) return { available: false, reason: "Room does not exist" };

  // Check if room has capacity
  if (room.currentGuests >= room.capacity) {
    return { available: false, reason: "Room is full" };
  }

  // Check for conflicting bookings
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const hasConflict = existingBookings.some((booking) => {
    const bookingStart = new Date(booking.checkIn);
    const bookingEnd = new Date(booking.checkOut);

    return (
      (checkInDate >= bookingStart && checkInDate < bookingEnd) ||
      (checkOutDate > bookingStart && checkOutDate <= bookingEnd) ||
      (checkInDate < bookingStart && checkOutDate > bookingEnd)
    );
  });

  if (hasConflict) {
    return { available: false, reason: "Room is already booked for these dates" };
  }

  return { available: true };
};

/**
 * Log chat interaction for analytics
 */
export const logChatInteraction = (event, data = {}) => {
  const timestamp = new Date().toISOString();
  const interaction = {
    event,
    timestamp,
    userAgent: navigator.userAgent,
    ...data,
  };

  // Currently only log to console, not saving to localStorage
  // (can be replaced with sending to Supabase/API analytics in the future)
  // eslint-disable-next-line no-console
  console.debug("Chat interaction:", interaction);
};

/**
 * Generate booking confirmation details
 */
export const generateBookingConfirmation = (booking, room) => {
  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const totalPrice = calculateTotalPrice(room.price, nights);

  return {
    confirmationCode: booking.confirmationCode || `${Date.now()}`,
    room: {
      name: room.name,
      type: room.type,
      price: room.price,
      amenities: room.amenities || [],
    },
    guest: {
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
    },
    dates: {
      checkIn: formatDateDisplay(booking.checkIn),
      checkOut: formatDateDisplay(booking.checkOut),
      nights,
    },
    guests: {
      adults: booking.adults,
      kids: booking.kids,
      total: booking.adults + booking.kids,
    },
    pricing: {
      pricePerNight: room.price,
      nights,
      subtotal: room.price * nights,
      tax: Math.round(room.price * nights * 0.1 * 100) / 100,
      total: totalPrice,
    },
    specialRequests: booking.specialRequests,
    created: new Date().toISOString(),
  };
};

export default {
  validateBookingForm,
  validateFilterForm,
  sanitizeInput,
  formatErrorMessage,
  isValidEmail,
  isValidPhone,
  formatDateDisplay,
  calculateNights,
  calculateTotalPrice,
  checkRoomAvailability,
  logChatInteraction,
  generateBookingConfirmation,
  BookingErrors,
};
