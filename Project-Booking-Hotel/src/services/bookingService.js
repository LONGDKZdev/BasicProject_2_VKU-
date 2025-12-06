import { supabase } from '../utils/supabaseClient';

/**
 * Service layer for room booking operations
 */

export const createBooking = async (bookingData) => {
  try {
    // Không gửi trường id lên Supabase để dùng default gen_random_uuid()
    const { id, ...payload } = bookingData || {};

    const { data, error } = await supabase
      .from('bookings')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating room booking:', err);
    return null;
  }
};

export const fetchUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user room bookings:', err);
    return [];
  }
};

export const updateBookingStatus = async (bookingId, status, extraData = {}) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, ...extraData })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating room booking status:', err);
    return null;
  }
};

export const createBookingItems = async (bookingId, roomId, roomTypeId, pricingBreakdown) => {
  try {
    if (!pricingBreakdown || pricingBreakdown.length === 0) {
      console.warn('No pricing breakdown provided for booking items');
      return [];
    }
    
    // Create one item per night
    const items = pricingBreakdown.map((night) => ({
      booking_id: bookingId,
      room_id: roomId,
      room_type_id: roomTypeId,
      price_per_night: night.rate,
      nights: 1, // Each breakdown item is 1 night
      amount: night.rate,
    }));
    
    const { data, error } = await supabase
      .from('booking_items')
      .insert(items)
      .select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} booking items for booking ${bookingId}`);
    return data || [];
  } catch (err) {
    console.error('Error creating booking items:', err);
    return [];
  }
};

export const createBookingPricingBreakdown = async (bookingId, pricingBreakdown) => {
  try {
    if (!pricingBreakdown || pricingBreakdown.length === 0) {
      console.warn('No pricing breakdown provided');
      return [];
    }
    
    // Create one record per night with rate_type
    const breakdownRecords = pricingBreakdown.map((night) => ({
      booking_id: bookingId,
      stay_date: night.date, // Format: YYYY-MM-DD
      rate_type: night.label || 'Standard rate', // e.g., "Weekend rate", "Holiday rate"
      rate: night.rate,
    }));
    
    const { data, error } = await supabase
      .from('booking_pricing_breakdown')
      .insert(breakdownRecords)
      .select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} pricing breakdown records for booking ${bookingId}`);
    return data || [];
  } catch (err) {
    console.error('Error creating booking pricing breakdown:', err);
    return [];
  }
};

/**
 * Service layer for restaurant booking operations
 */

export const createRestaurantBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .insert([{
        user_id: bookingData.userId,
        confirmation_code: bookingData.confirmationCode,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        reservation_at: bookingData.reservationAt,
        guests: bookingData.guests || 1,
        special_requests: bookingData.specialRequests || '',
        price: bookingData.price || 0,
        total_price: bookingData.totalPrice || 0,
        status: bookingData.status || 'pending_payment',
        payment_method: bookingData.paymentMethod || null,
        paid_at: bookingData.paidAt || null,
      }])
      .select();
    if (error) throw error;
    console.log('✅ Restaurant booking saved:', data?.[0]?.confirmation_code);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error creating restaurant booking:', err);
    return null;
  }
};

export const updateRestaurantBookingStatus = async (bookingId, status, extraData = {}) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update({ 
        status,
        ...extraData,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    console.log('✅ Restaurant booking updated:', status);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error updating restaurant booking:', err);
    return null;
  }
};

export const fetchUserRestaurantBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user restaurant bookings:', err);
    return [];
  }
};


/**
 * Service layer for spa booking operations
 */

export const createSpaBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .insert([{
        user_id: bookingData.userId,
        confirmation_code: bookingData.confirmationCode,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        appointment_at: bookingData.appointmentAt,
        service_name: bookingData.serviceName,
        service_duration: bookingData.duration || '',
        therapist: bookingData.therapist || '',
        special_requests: bookingData.specialRequests || '',
        price: bookingData.price || 0,
        total_price: bookingData.totalPrice || 0,
        status: bookingData.status || 'pending_payment',
        payment_method: bookingData.paymentMethod || null,
        paid_at: bookingData.paidAt || null,
      }])
      .select();
    if (error) throw error;
    console.log('✅ Spa booking saved:', data?.[0]?.confirmation_code);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error creating spa booking:', err);
    return null;
  }
};

export const updateSpaBookingStatus = async (bookingId, status, extraData = {}) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .update({ 
        status,
        ...extraData,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    console.log('✅ Spa booking updated:', status);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error updating spa booking:', err);
    return null;
  }
};

export const fetchUserSpaBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user spa bookings:', err);
    return [];
  }
};

/**
 * Cancellation functions with refund logic
 */
export const cancelRoomBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        refund_amount: null // Calculate based on cancellation policy
      })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error cancelling room booking:', err);
    throw err;
  }
};

export const cancelRestaurantBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error cancelling restaurant booking:', err);
    throw err;
  }
};

export const cancelSpaBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error cancelling spa booking:', err);
    throw err;
  }
};

export default {
    createBooking,
    fetchUserBookings,
    updateBookingStatus,
    createBookingItems,
    createBookingPricingBreakdown,
    createRestaurantBooking,
    updateRestaurantBookingStatus,
    fetchUserRestaurantBookings,
    createSpaBooking,
    updateSpaBookingStatus,
    fetchUserSpaBookings,
    cancelRoomBooking,
    cancelRestaurantBooking,
    cancelSpaBooking,
};