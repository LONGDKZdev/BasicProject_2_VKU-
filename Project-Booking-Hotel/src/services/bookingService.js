import { supabase } from '../utils/supabaseClient';

/**
 * Service layer for room booking operations
 */

export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
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

export default {
    createBooking,
    fetchUserBookings,
    updateBookingStatus,
    createRestaurantBooking,
    updateRestaurantBookingStatus,
    fetchUserRestaurantBookings,
    createSpaBooking,
    updateSpaBookingStatus,
    fetchUserSpaBookings,
};