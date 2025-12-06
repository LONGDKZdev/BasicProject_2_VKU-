/**
 * C# API Service
 * Optional service to call C# backend API for complex business logic
 * 
 * To use: Set VITE_API_URL in .env file
 * Example: VITE_API_URL=http://localhost:5000
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Calculate booking price using C# backend
 * This provides more accurate pricing with weekend surcharges and promotions
 */
export const calculateBookingPrice = async (bookingData) => {
  try {
    const response = await fetch(`${API_URL}/api/bookings/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        basePricePerNight: bookingData.basePricePerNight,
        baseCapacity: bookingData.baseCapacity || 2,
        numAdults: bookingData.numAdults || 1,
        numChildren: bookingData.numChildren || 0,
        promoCode: bookingData.promoCode || null
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('C# API not available, using frontend calculation:', error);
    // Fallback to frontend calculation if API is not available
    return null;
  }
};

/**
 * Validate booking using C# backend
 */
export const validateBooking = async (bookingData) => {
  try {
    const response = await fetch(`${API_URL}/api/bookings/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        numAdults: bookingData.numAdults || 1,
        numChildren: bookingData.numChildren || 0,
        baseCapacity: bookingData.baseCapacity || 2,
        maxCapacity: bookingData.maxCapacity || 4
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('C# API not available:', error);
    return { isValid: true, errors: [], warnings: [] };
  }
};

/**
 * Generate confirmation code using C# backend
 */
export const generateConfirmationCode = async (type = 'room') => {
  try {
    const response = await fetch(`${API_URL}/api/bookings/generate-confirmation-code?type=${type}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.confirmationCode;
  } catch (error) {
    console.warn('C# API not available, using frontend generation:', error);
    // Fallback to frontend generation
    const prefix = type.toUpperCase().substring(0, 3);
    const random = Math.floor(Math.random() * 100000);
    return `${prefix}-${random}`;
  }
};

