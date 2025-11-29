/**
 * Booking Mutations - Create, update, delete booking data in Supabase
 */

import { supabase } from '../../utils/supabaseClient';

/**
 * Create new booking
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Object|null>} Created booking or null
 */
export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Booking created:', data.id);
    return data;
  } catch (err) {
    console.error('❌ Error creating booking:', err);
    return null;
  }
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Booking ${bookingId} status updated to ${status}`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating booking status:`, err);
    return null;
  }
};

/**
 * Update booking payment details
 * @param {string} bookingId - Booking ID
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const updateBookingPayment = async (bookingId, paymentData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...paymentData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Booking ${bookingId} payment updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating booking payment:`, err);
    return null;
  }
};

/**
 * Cancel booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Booking ${bookingId} cancelled`);
    return data;
  } catch (err) {
    console.error(`❌ Error cancelling booking:`, err);
    return null;
  }
};

/**
 * Add booking item (extra service, etc.)
 * @param {string} bookingId - Booking ID
 * @param {Object} itemData - Item data
 * @returns {Promise<Object|null>} Created item or null
 */
export const addBookingItem = async (bookingId, itemData) => {
  try {
    const { data, error } = await supabase
      .from('booking_items')
      .insert([{ booking_id: bookingId, ...itemData }])
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Booking item added to ${bookingId}`);
    return data;
  } catch (err) {
    console.error(`❌ Error adding booking item:`, err);
    return null;
  }
};

/**
 * Remove booking item
 * @param {string} itemId - Booking item ID
 * @returns {Promise<boolean>} True if successful
 */
export const removeBookingItem = async (itemId) => {
  try {
    const { error } = await supabase
      .from('booking_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    console.log(`✅ Booking item ${itemId} removed`);
    return true;
  } catch (err) {
    console.error(`❌ Error removing booking item:`, err);
    return false;
  }
};

/**
 * Update booking notes
 * @param {string} bookingId - Booking ID
 * @param {string} notes - Notes
 * @returns {Promise<Object|null>} Updated booking or null
 */
export const updateBookingNotes = async (bookingId, notes) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        special_requests: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Booking ${bookingId} notes updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error updating booking notes:`, err);
    return null;
  }
};

/**
 * Bulk update bookings
 * @param {Array} bookingIds - Array of booking IDs
 * @param {Object} updateData - Data to update
 * @returns {Promise<Array|null>} Updated bookings or null
 */
export const bulkUpdateBookings = async (bookingIds, updateData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .in('id', bookingIds)
      .select();

    if (error) throw error;
    console.log(`✅ ${data.length} bookings updated`);
    return data;
  } catch (err) {
    console.error(`❌ Error bulk updating bookings:`, err);
    return null;
  }
};

/**
 * Delete booking (hard delete - use with caution)
 * @param {string} bookingId - Booking ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteBooking = async (bookingId) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;
    console.log(`✅ Booking ${bookingId} deleted`);
    return true;
  } catch (err) {
    console.error(`❌ Error deleting booking:`, err);
    return false;
  }
};
