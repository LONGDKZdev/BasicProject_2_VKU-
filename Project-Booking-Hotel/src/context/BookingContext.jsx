import { createContext, useContext, useState, useEffect } from 'react';
import { isBookingEmailConfigured, sendBookingConfirmationEmail } from '../utils/emailService';
import {
  createBooking, // for room bookings
  updateBookingStatus, // for room bookings
  createRestaurantBooking,
  updateRestaurantBookingStatus,
  createSpaBooking,
  updateSpaBookingStatus,
} from '../services/bookingService';

const BookingContext = createContext();

const getInitialBookings = (type) => {
  try {
    const key = `hotel_${type}_bookings`;
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    console.error(`Failed to parse stored ${type} bookings`, error);
    return [];
  }
};

const persistBookings = (bookings, type) => {
  const key = `hotel_${type}_bookings`;
  localStorage.setItem(key, JSON.stringify(bookings));
};

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString();
};

export const BookingProvider = ({ children }) => {
  const [roomBookings, setRoomBookings] = useState(() => getInitialBookings('room'));
  const [restaurantBookings, setRestaurantBookings] = useState(() => getInitialBookings('restaurant'));
  const [spaBookings, setSpaBookings] = useState(() => getInitialBookings('spa'));

  useEffect(() => {
    persistBookings(roomBookings, 'room');
  }, [roomBookings]);

  useEffect(() => {
    persistBookings(restaurantBookings, 'restaurant');
  }, [restaurantBookings]);

  useEffect(() => {
    persistBookings(spaBookings, 'spa');
  }, [spaBookings]);

  const createRoomBookingHandler = (bookingData) => {
    const confirmationCode = `ROOM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newBooking = {
      id: createId(),
      confirmationCode,
      bookingType: 'room',
      ...bookingData,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };

    // Prepare data for Supabase (matching schema in 01_create_schema_tables.txt)
    const supabaseData = {
      user_id: bookingData.userId,
      confirmation_code: confirmationCode,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      room_id: bookingData.roomId,
      room_name: bookingData.roomName,
      user_name: bookingData.userName,
      user_email: bookingData.userEmail,
      guest_name: bookingData.guestName,
      guest_phone: bookingData.guestPhone,
      note: bookingData.note,
      num_adults: bookingData.numAdults || 1,
      num_children: bookingData.numChildren || 0,
      total_nights: bookingData.totalNights || 1,
      subtotal: bookingData.subtotal || 0,
      discount: bookingData.discount || 0,
      total_amount: bookingData.totalAmount || 0,
      pricing_breakdown: bookingData.pricingBreakdown || [],
      status: 'pending_payment',
    };

    // ✅ SAVE TO SUPABASE
    createBooking(supabaseData).then((dbBooking) => {
      if (dbBooking) {
        newBooking.id = dbBooking.id;
        setRoomBookings(prev => [newBooking, ...prev]);
        console.log('✅ Room booking synced:', confirmationCode);
      }
    }).catch((err) => {
      console.error('❌ Failed to save room booking to Supabase:', err);
      // Fallback to localStorage
      setRoomBookings(prev => [newBooking, ...prev]);
    });

    return { success: true, booking: newBooking };
  };

  const createRestaurantBookingHandler = (bookingData) => {
    const confirmationCode = `RES-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newBooking = {
      id: createId(),
      confirmationCode,
      type: 'restaurant',
      ...bookingData,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };

    // ✅ SAVE TO SUPABASE
    createRestaurantBooking({
      userId: bookingData.userId,
      confirmationCode,
      name: bookingData.name || bookingData.userName,
      email: bookingData.email || bookingData.userEmail,
      phone: bookingData.phone,
      reservationAt: bookingData.date,
      guests: bookingData.guests || 1,
      specialRequests: bookingData.specialRequests || '',
      price: bookingData.price || 0,
      totalPrice: bookingData.totalPrice || 0,
      status: 'pending_payment',
    }).then((dbBooking) => {
      if (dbBooking) {
        newBooking.id = dbBooking.id;
        setRestaurantBookings(prev => [newBooking, ...prev]);
        console.log('✅ Restaurant booking synced:', confirmationCode);
      }
    }).catch((err) => {
      console.error('❌ Failed to save to Supabase:', err);
      // Fallback to localStorage
      setRestaurantBookings(prev => [newBooking, ...prev]);
    });

    return { success: true, booking: newBooking };
  };

  const createSpaBookingHandler = (bookingData) => {
    const confirmationCode = `SPA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newBooking = {
      id: createId(),
      confirmationCode,
      type: 'spa',
      ...bookingData,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };

    // ✅ SAVE TO SUPABASE
    createSpaBooking({
      userId: bookingData.userId,
      confirmationCode,
      name: bookingData.name || bookingData.userName,
      email: bookingData.email || bookingData.userEmail,
      phone: bookingData.phone,
      appointmentAt: bookingData.date,
      serviceName: bookingData.serviceName || bookingData.service,
      duration: bookingData.duration || '',
      therapist: bookingData.therapist || '',
      specialRequests: bookingData.specialRequests || '',
      price: bookingData.price || 0,
      totalPrice: bookingData.totalPrice || 0,
      status: 'pending_payment',
    }).then((dbBooking) => {
      if (dbBooking) {
        newBooking.id = dbBooking.id;
        setSpaBookings(prev => [newBooking, ...prev]);
        console.log('✅ Spa booking synced:', confirmationCode);
      }
    }).catch((err) => {
      console.error('❌ Failed to save to Supabase:', err);
      // Fallback to localStorage
      setSpaBookings(prev => [newBooking, ...prev]);
    });

    return { success: true, booking: newBooking };
  };

  const confirmRoomBooking = (bookingId, paymentData) => {
    let confirmedBooking = null;
    setRoomBookings(prev => prev.map(booking => {
      if (booking.id !== bookingId) return booking;
      confirmedBooking = {
        ...booking,
        ...paymentData,
        status: 'confirmed',
        paidAt: paymentData.paidAt || new Date().toISOString(),
      };

      // ✅ SYNC TO SUPABASE
      updateBookingStatus(booking.id, 'confirmed', {
        payment_method: paymentData.paymentMethod,
        payment_code: paymentData.paymentCode,
        paid_at: confirmedBooking.paidAt,
      }).catch((err) => {
        console.error('❌ Failed to update Supabase:', err);
      });
      
      // Automatically send invoice email
      sendBookingConfirmationEmail({
        toEmail: booking.userEmail || booking.email,
        toName: booking.userName || booking.name,
        booking: confirmedBooking
      });
      
      return confirmedBooking;
    }));
    return confirmedBooking;
  };

  const confirmRestaurantBooking = (bookingId, paymentData) => {
    let confirmedBooking = null;
    setRestaurantBookings(prev => prev.map(booking => {
      if (booking.id !== bookingId) return booking;
      confirmedBooking = {
        ...booking,
        ...paymentData,
        status: 'confirmed',
        paidAt: paymentData.paidAt || new Date().toISOString(),
      };

      // ✅ SYNC TO SUPABASE
      updateRestaurantBookingStatus(booking.id, 'confirmed', {
        payment_method: paymentData.paymentMethod,
        payment_code: paymentData.paymentCode,
        paid_at: confirmedBooking.paidAt,
      }).catch((err) => {
        console.error('❌ Failed to update Supabase:', err);
      });
      
      // Automatically send invoice email
      sendBookingConfirmationEmail({
        toEmail: booking.userEmail || booking.email,
        toName: booking.userName || booking.name,
        booking: confirmedBooking
      });
      
      return confirmedBooking;
    }));
    return confirmedBooking;
  };

  const confirmSpaBooking = (bookingId, paymentData) => {
    let confirmedBooking = null;
    setSpaBookings(prev => prev.map(booking => {
      if (booking.id !== bookingId) return booking;
      confirmedBooking = {
        ...booking,
        ...paymentData,
        status: 'confirmed',
        paidAt: paymentData.paidAt || new Date().toISOString(),
      };

      // ✅ SYNC TO SUPABASE
      updateSpaBookingStatus(booking.id, 'confirmed', {
        payment_method: paymentData.paymentMethod,
        payment_code: paymentData.paymentCode,
        paid_at: confirmedBooking.paidAt,
      }).catch((err) => {
        console.error('❌ Failed to update Supabase:', err);
      });
      
      // Automatically send invoice email
      sendBookingConfirmationEmail({
        toEmail: booking.userEmail || booking.email,
        toName: booking.userName || booking.name,
        booking: confirmedBooking
      });
      
      return confirmedBooking;
    }));
    return confirmedBooking;
  };

  const getUserRoomBookings = (userId) => {
    return roomBookings.filter(booking => booking.userId === userId);
  };

  const getUserRestaurantBookings = (userId) => {
    return restaurantBookings.filter(booking => booking.userId === userId);
  };

  const getUserSpaBookings = (userId) => {
    return spaBookings.filter(booking => booking.userId === userId);
  };

  const getAllBookings = () => {
    return {
      room: roomBookings,
      restaurant: restaurantBookings,
      spa: spaBookings,
    };
  };

  const value = {
    roomBookings,
    restaurantBookings,
    spaBookings,
    createRoomBooking: createRoomBookingHandler,
    createRestaurantBooking: createRestaurantBookingHandler,
    createSpaBooking: createSpaBookingHandler,
    confirmRoomBooking,
    confirmRestaurantBooking,
    confirmSpaBooking,
    getUserRoomBookings,
    getUserRestaurantBookings,
    getUserSpaBookings,
    getAllBookings,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within BookingProvider');
  }
  return context;
};
