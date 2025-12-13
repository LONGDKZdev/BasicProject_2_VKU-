import { supabase } from '../utils/supabaseClient';

/**
 * ============================================================================
 * ADMIN SERVICE LAYER - FINALIZED
 * ============================================================================
 * 
 * This service centralizes ALL admin-related database operations.
 * Provides clean, normalized data to admin components.
 * 
 * Patterns:
 * - All functions return array/object or null on error
 * - All functions include try/catch with logging
 * - Normalization happens here, not in components
 * - Booking types are combined into single functions where appropriate
 * ============================================================================
 */

// ============================================================================
// BOOKING MANAGEMENT - FETCH
// ============================================================================

/**
 * Fetch all room bookings with related data
 * @returns {Promise<Array>} Array of normalized room bookings
 */
export const fetchAllRoomBookingsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (id, room_no),
        profiles:user_id (id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(booking => ({
      ...booking,
      type: 'room',
      item_name: booking.rooms?.room_no || 'N/A',
      guestName: booking.profiles?.full_name,
      guestEmail: booking.profiles?.email,
      guestPhone: booking.profiles?.phone,
      totalPrice: parseFloat(booking.total_amount || 0),
      checkIn: booking.check_in, // Map check_in to checkIn
      checkOut: booking.check_out, // Map check_out to checkOut
    }));
  } catch (err) {
    console.error('❌ Error fetching room bookings for admin:', err);
    return [];
  }
};

/**
 * Fetch all restaurant bookings with related data
 * @returns {Promise<Array>} Array of normalized restaurant bookings
 */
export const fetchAllRestaurantBookingsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('restaurant_bookings')
      .select(`
        *,
        profiles:user_id (id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`[Admin] Fetched ${data?.length || 0} restaurant bookings from DB`);
    
    return (data || []).map(booking => ({
      ...booking,
      type: 'restaurant',
      item_name: 'Restaurant Table',
      guestName: booking.name || booking.profiles?.full_name,
      guestEmail: booking.email || booking.profiles?.email,
      guestPhone: booking.phone || booking.profiles?.phone,
      totalPrice: parseFloat(booking.total_price || 0),
      checkIn: booking.reservation_at,
      checkOut: booking.reservation_at,
    }));
  } catch (err) {
    console.error('❌ Error fetching restaurant bookings for admin:', err);
    console.error('Error details:', {
      message: err.message,
      details: err.details,
      hint: err.hint,
      code: err.code
    });
    return [];
  }
};

/**
 * Fetch all spa bookings with related data
 * @returns {Promise<Array>} Array of normalized spa bookings
 */
export const fetchAllSpaBookingsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .select(`
        *,
        profiles:user_id (id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`[Admin] Fetched ${data?.length || 0} spa bookings from DB`);
    
    return (data || []).map(booking => ({
      ...booking,
      type: 'spa',
      item_name: booking.service_name || 'Spa Service',
      guestName: booking.name || booking.profiles?.full_name,
      guestEmail: booking.email || booking.profiles?.email,
      guestPhone: booking.phone || booking.profiles?.phone,
      totalPrice: parseFloat(booking.total_price || 0),
      checkIn: booking.appointment_at,
      checkOut: booking.appointment_at,
    }));
  } catch (err) {
    console.error('❌ Error fetching spa bookings for admin:', err);
    console.error('Error details:', {
      message: err.message,
      details: err.details,
      hint: err.hint,
      code: err.code
    });
    return [];
  }
};

/**
 * Fetch ALL bookings (Room + Restaurant + Spa) combined and normalized
 * @returns {Promise<Array>} Single array of all booking types, sorted by date
 */
export const fetchAllBookingsForAdmin = async () => {
  try {
    const [roomBookings, restBookings, spaBookings] = await Promise.all([
      fetchAllRoomBookingsForAdmin(),
      fetchAllRestaurantBookingsForAdmin(),
      fetchAllSpaBookingsForAdmin(),
    ]);

    // Combine and sort by created_at descending
    const combined = [...roomBookings, ...restBookings, ...spaBookings]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`✅ Loaded ${combined.length} total bookings (${roomBookings.length} room, ${restBookings.length} restaurant, ${spaBookings.length} spa)`);
    return combined;
  } catch (err) {
    console.error('❌ Error fetching all bookings:', err);
    return [];
  }
};

// ============================================================================
// BOOKING MANAGEMENT - UPDATE & DELETE
// ============================================================================

/**
 * Update booking status for any booking type
 * @param {string} bookingId - Booking ID
 * @param {string} bookingType - 'room', 'restaurant', or 'spa'
 * @param {string} status - New status value
 * @param {object} extraData - Additional fields to update
 * @returns {Promise<object|null>} Updated booking or null
 */
export const updateBookingStatus = async (bookingId, bookingType, status, extraData = {}) => {
  try {
    const tableMap = {
      room: 'bookings',
      restaurant: 'restaurant_bookings',
      spa: 'spa_bookings',
    };

    const table = tableMap[bookingType];
    if (!table) throw new Error(`Invalid booking type: ${bookingType}`);

    const { data, error } = await supabase
      .from(table)
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...extraData,
      })
      .eq('id', bookingId)
      .select();

    if (error) throw error;

    console.log(`✅ Booking ${bookingId} (${bookingType}) updated to status: ${status}`);
    const updated = data?.[0] || null;

    // Side-effect: update room status/history when room booking
    if (bookingType === 'room' && updated?.room_id) {
      try {
        if (status === 'checked_in' || status === 'confirmed') {
          await supabase
            .from('rooms')
            .update({ status: 'occupied', updated_at: new Date().toISOString() })
            .eq('id', updated.room_id);
          await supabase.from('room_status_history').insert([{
            room_id: updated.room_id,
            status: 'occupied',
            note: `Admin set booking ${bookingId} to ${status}`,
          }]);
        } else if (status === 'checked_out' || status === 'cancelled') {
          await supabase
            .from('rooms')
            .update({ status: 'available', updated_at: new Date().toISOString() })
            .eq('id', updated.room_id);
          await supabase.from('room_status_history').insert([{
            room_id: updated.room_id,
            status: 'available',
            note: `Admin set booking ${bookingId} to ${status}`,
          }]);
        }
      } catch (sideErr) {
        console.warn('Room status history side-effect failed:', sideErr);
      }
    }

    return updated;
  } catch (err) {
    console.error(`❌ Error updating booking status:`, err);
    return null;
  }
};

/**
 * Delete a booking (any type)
 * @param {string} bookingId - Booking ID
 * @param {string} bookingType - 'room', 'restaurant', or 'spa'
 * @returns {Promise<boolean>} Success or failure
 */
export const deleteBooking = async (bookingId, bookingType) => {
  try {
    const tableMap = {
      room: 'bookings',
      restaurant: 'restaurant_bookings',
      spa: 'spa_bookings',
    };

    const table = tableMap[bookingType];
    if (!table) throw new Error(`Invalid booking type: ${bookingType}`);

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', bookingId);

    if (error) throw error;

    console.log(`✅ Booking ${bookingId} (${bookingType}) deleted`);
    return true;
  } catch (err) {
    console.error(`❌ Error deleting booking:`, err);
    return false;
  }
};

// ============================================================================
// ROOM STATUS BOARD (view)
// ============================================================================
export const fetchRoomStatusBoardForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('room_status_board')
      .select('*')
      .order('room_no', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching room status board:', err);
    return [];
  }
};

// ============================================================================
// USER MANAGEMENT - FETCH
// ============================================================================

/**
 * Fetch all users/profiles with admin-relevant data
 * @returns {Promise<Array>} Array of user profiles
 */
export const fetchAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Loaded ${data?.length || 0} users`);
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    return [];
  }
};

/**
 * Fetch user by ID with detailed info
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} User profile or null
 */
export const fetchUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error(`❌ Error fetching user ${userId}:`, err);
    return null;
  }
};

/**
 * Update user profile (admin operation)
 * @param {string} userId - User ID
 * @param {object} updateData - Fields to update
 * @returns {Promise<object|null>} Updated user or null
 */
export const updateUser = async (userId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;

    console.log(`✅ User ${userId} profile updated`);
    return data?.[0] || null;
  } catch (err) {
    console.error(`❌ Error updating user:`, err);
    return null;
  }
};

/**
 * Delete user profile (admin operation)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success or failure
 */
export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    console.log(`✅ User ${userId} deleted`);
    return true;
  } catch (err) {
    console.error(`❌ Error deleting user:`, err);
    return false;
  }
};

// ============================================================================
// AUDIT & LOGS
// ============================================================================

/**
 * Fetch audit logs (if table exists)
 * @param {number} limit - Number of records to fetch
 * @returns {Promise<Array>} Array of audit log entries
 */
export const fetchAuditLogs = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:user_id (id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ Loaded ${data?.length || 0} audit logs`);
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching audit logs:', err);
    return [];
  }
};

/**
 * Create audit log entry
 * @param {object} logData - Log entry data
 * @returns {Promise<object|null>} Created log entry or null
 */
export const createAuditLog = async (logData) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: logData.userId,
        action: logData.action,
        entity_type: logData.entityType,
        entity_id: logData.entityId,
        description: logData.description,
        changes: logData.changes || {},
        ip_address: logData.ipAddress,
        created_at: new Date().toISOString(),
      }])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error creating audit log:', err);
    return null;
  }
};

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get dashboard statistics (bookings, users, revenue)
 * @returns {Promise<object>} Stats object
 */
export const getAdminDashboardStats = async () => {
  try {
    // Fetch counts in parallel
    const [
      { count: totalRoomBookings },
      { count: totalRestaurantBookings },
      { count: totalSpaBookings },
      { count: totalUsers },
      roomBookingsData,
      restaurantBookingsData,
      spaBookingsData,
    ] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('restaurant_bookings').select('id', { count: 'exact', head: true }),
      supabase.from('spa_bookings').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_amount, status'),
      supabase.from('restaurant_bookings').select('total_price, status'),
      supabase.from('spa_bookings').select('total_price, status'),
    ]);

    // Calculate revenue
    const roomRevenue = (roomBookingsData.data || [])
      .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
    const restRevenue = (restaurantBookingsData.data || [])
      .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
    const spaRevenue = (spaBookingsData.data || [])
      .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);

    const totalRevenue = roomRevenue + restRevenue + spaRevenue;

    const stats = {
      totalBookings: (totalRoomBookings || 0) + (totalRestaurantBookings || 0) + (totalSpaBookings || 0),
      totalRoomBookings: totalRoomBookings || 0,
      totalRestaurantBookings: totalRestaurantBookings || 0,
      totalSpaBookings: totalSpaBookings || 0,
      totalUsers: totalUsers || 0,
      totalRevenue: totalRevenue.toFixed(2),
      roomRevenue: roomRevenue.toFixed(2),
      restaurantRevenue: restRevenue.toFixed(2),
      spaRevenue: spaRevenue.toFixed(2),
    };

    console.log('✅ Dashboard stats loaded:', stats);
    return stats;
  } catch (err) {
    console.error('❌ Error fetching dashboard stats:', err);
    return {
      totalBookings: 0,
      totalRoomBookings: 0,
      totalRestaurantBookings: 0,
      totalSpaBookings: 0,
      totalUsers: 0,
      totalRevenue: '0.00',
      roomRevenue: '0.00',
      restaurantRevenue: '0.00',
      spaRevenue: '0.00',
    };
  }
};

/**
 * Get booking status breakdown (how many in each status)
 * @returns {Promise<object>} Status breakdown counts
 */
export const getBookingStatusBreakdown = async () => {
  try {
    // Simplified status list (removed: pending, approved, modified, rejected)
    const statuses = ['pending_payment', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled'];

    const breakdowns = {};

    for (const status of statuses) {
      const [
        { count: roomCount },
        { count: restCount },
        { count: spaCount },
      ] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', status),
        supabase.from('restaurant_bookings').select('id', { count: 'exact', head: true }).eq('status', status),
        supabase.from('spa_bookings').select('id', { count: 'exact', head: true }).eq('status', status),
      ]);

      breakdowns[status] = {
        room: roomCount || 0,
        restaurant: restCount || 0,
        spa: spaCount || 0,
        total: (roomCount || 0) + (restCount || 0) + (spaCount || 0),
      };
    }

    console.log('✅ Booking status breakdown loaded');
    return breakdowns;
  } catch (err) {
    console.error('❌ Error fetching booking status breakdown:', err);
    return {};
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Bookings - Fetch
  fetchAllRoomBookingsForAdmin,
  fetchAllRestaurantBookingsForAdmin,
  fetchAllSpaBookingsForAdmin,
  fetchAllBookingsForAdmin,

  // Bookings - Update/Delete
  updateBookingStatus,
  deleteBooking,

  // Users
  fetchAllUsers,
  fetchUserById,
  updateUser,
  deleteUser,

  // Audit & Logs
  fetchAuditLogs,
  createAuditLog,

  // Statistics
  getAdminDashboardStats,
  getBookingStatusBreakdown,
};
