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
        users:user_id (id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(booking => ({
      ...booking,
      type: 'room',
      item_name: booking.rooms?.room_no || 'N/A',
      guestName: booking.users?.full_name,
      guestEmail: booking.users?.email,
      guestPhone: booking.users?.phone,
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
        users:user_id (id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`[Admin] Fetched ${data?.length || 0} restaurant bookings from DB`);
    
    return (data || []).map(booking => ({
      ...booking,
      type: 'restaurant',
      item_name: `Restaurant Table (${booking.guests || 1} guest${(booking.guests || 1) > 1 ? 's' : ''})`,
      guestName: booking.name || booking.users?.full_name,
      guestEmail: booking.email || booking.users?.email,
      guestPhone: booking.phone || booking.users?.phone,
      totalPrice: parseFloat(booking.total_price || 0),
      checkIn: booking.reservation_at,
      checkOut: booking.reservation_at,
      guests: booking.guests || 1,
      special_requests: booking.special_requests,
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
        users:user_id (id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`[Admin] Fetched ${data?.length || 0} spa bookings from DB`);
    
    return (data || []).map(booking => ({
      ...booking,
      type: 'spa',
      item_name: booking.service_name || 'Spa Service',
      guestName: booking.name || booking.users?.full_name,
      guestEmail: booking.email || booking.users?.email,
      guestPhone: booking.phone || booking.users?.phone,
      totalPrice: parseFloat(booking.total_price || 0),
      checkIn: booking.appointment_at,
      checkOut: booking.appointment_at,
      service_name: booking.service_name,
      service_duration: booking.service_duration,
      therapist: booking.therapist,
      special_requests: booking.special_requests,
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
        const roomId = updated.room_id;
        let newRoomStatus = null;
        let statusNote = '';
        
        // Determine new room status based on booking status
        if (status === 'checked_in') {
          newRoomStatus = 'occupied';
          statusNote = `Booking ${bookingId} checked in`;
        } else if (status === 'checked_out' || status === 'cancelled') {
          // Check if there are other active bookings for this room
          const { data: activeBookings } = await supabase
            .from('bookings')
            .select('id, status, check_in, check_out')
            .eq('room_id', roomId)
            .in('status', ['confirmed', 'checked_in', 'pending_payment'])
            .neq('id', bookingId);
          
          // If no other active bookings, set to available
          if (!activeBookings || activeBookings.length === 0) {
            newRoomStatus = 'available';
            statusNote = `Booking ${bookingId} ${status === 'checked_out' ? 'checked out' : 'cancelled'}`;
          } else {
            // Check if any other booking is checked_in
            const hasCheckedIn = activeBookings.some(b => b.status === 'checked_in');
            if (hasCheckedIn) {
              newRoomStatus = 'occupied';
              statusNote = `Booking ${bookingId} ${status}, but room still occupied by other booking`;
            } else {
              // Room can be available or cleaning depending on business logic
              newRoomStatus = 'available';
              statusNote = `Booking ${bookingId} ${status}, room available`;
            }
          }
        } else if (status === 'confirmed') {
          // Check if room should be marked as occupied for confirmed bookings
          // Check if booking date is today or in the past
          const checkInDate = new Date(updated.check_in);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          checkInDate.setHours(0, 0, 0, 0);
          
          if (checkInDate <= today) {
            // Booking is for today or past, mark as occupied
            newRoomStatus = 'occupied';
            statusNote = `Booking ${bookingId} confirmed and active`;
          } else {
            // Future booking, keep room available for now
            newRoomStatus = 'available';
            statusNote = `Booking ${bookingId} confirmed for future date`;
          }
        } else if (status === 'pending_payment') {
          // Pending payment bookings don't block the room
          // Check if there are other checked_in bookings
          const { data: activeBookings } = await supabase
            .from('bookings')
            .select('id, status')
            .eq('room_id', roomId)
            .eq('status', 'checked_in')
            .neq('id', bookingId);
          
          if (activeBookings && activeBookings.length > 0) {
            newRoomStatus = 'occupied';
            statusNote = `Booking ${bookingId} pending payment, but room occupied by other booking`;
          } else {
            newRoomStatus = 'available';
            statusNote = `Booking ${bookingId} pending payment`;
          }
        }
        
        // Update room status if determined
        if (newRoomStatus) {
          await supabase
            .from('rooms')
            .update({ status: newRoomStatus, updated_at: new Date().toISOString() })
            .eq('id', roomId);
          
          // Insert status history
          await supabase.from('room_status_history').insert([{
            room_id: roomId,
            status: newRoomStatus,
            note: statusNote,
            started_at: new Date().toISOString(),
          }]);
          
          console.log(`✅ Room ${roomId} status updated to ${newRoomStatus} due to booking ${bookingId} status change to ${status}`);
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
    // Fetch room status board view
    const { data: boardData, error: boardError } = await supabase
      .from('room_status_board')
      .select('*')
      .order('room_no', { ascending: true });
    
    if (boardError) throw boardError;
    
    // Also check actual bookings to ensure accuracy
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('room_id, status, check_in, check_out')
      .in('status', ['confirmed', 'checked_in', 'pending_payment'])
      .gte('check_out', new Date().toISOString().split('T')[0]); // Only future or current bookings
    
    // Enhance board data with real-time booking status
    const enhancedBoard = (boardData || []).map(room => {
      // Check if room has any checked_in bookings
      const checkedInBookings = activeBookings?.filter(
        b => b.room_id === room.room_id && b.status === 'checked_in'
      ) || [];
      
      // Check if room has any confirmed bookings for today or past
      const today = new Date().toISOString().split('T')[0];
      const activeConfirmedBookings = activeBookings?.filter(
        b => b.room_id === room.room_id && 
             b.status === 'confirmed' && 
             b.check_in <= today
      ) || [];
      
      // Determine actual status
      let actualStatus = room.last_recorded_status || room.current_status;
      if (checkedInBookings.length > 0) {
        actualStatus = 'occupied';
      } else if (activeConfirmedBookings.length > 0) {
        actualStatus = 'occupied';
      } else if (room.current_status === 'occupied' && checkedInBookings.length === 0) {
        // Room marked as occupied but no active checked_in bookings - might need cleaning
        actualStatus = 'cleaning';
      }
      
      return {
        ...room,
        actual_status: actualStatus,
        has_active_booking: (checkedInBookings.length > 0 || activeConfirmedBookings.length > 0),
        checked_in_count: checkedInBookings.length,
      };
    });
    
    return enhancedBoard;
  } catch (err) {
    console.error('❌ Error fetching room status board:', err);
    return [];
  }
};

// ============================================================================
// ROOM TYPES MANAGEMENT - CRUD
// ============================================================================

/**
 * Fetch all room types for admin
 * @returns {Promise<Array>} Array of room types
 */
export const fetchRoomTypesForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Loaded ${data?.length || 0} room types`);
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching room types:', err);
    return [];
  }
};

/**
 * Create a new room type
 * @param {object} roomTypeData - Room type data
 * @returns {Promise<object|null>} Created room type or null
 */
export const createRoomType = async (roomTypeData) => {
  try {
    // Validation
    if (!roomTypeData.code || !roomTypeData.name) {
      throw new Error('Room type code and name are required');
    }
    if (roomTypeData.base_capacity && roomTypeData.base_capacity <= 0) {
      throw new Error('Base capacity must be greater than 0');
    }
    if (roomTypeData.max_person && roomTypeData.max_person <= 0) {
      throw new Error('Max person must be greater than 0');
    }
    if (roomTypeData.base_price !== undefined && roomTypeData.base_price < 0) {
      throw new Error('Base price cannot be negative');
    }

    const { data, error } = await supabase
      .from('room_types')
      .insert([{
        code: roomTypeData.code,
        name: roomTypeData.name,
        description: roomTypeData.description || null,
        base_capacity: roomTypeData.base_capacity || 2,
        max_person: roomTypeData.max_person || 2,
        base_price: roomTypeData.base_price || 0,
        facilities: roomTypeData.facilities || [],
        hotel_rules: roomTypeData.hotel_rules || [],
        cancellation_policy: roomTypeData.cancellation_policy || null,
        is_active: roomTypeData.is_active !== undefined ? roomTypeData.is_active : true,
      }])
      .select();

    if (error) throw error;

    console.log(`✅ Room type created: ${data?.[0]?.code}`);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error creating room type:', err);
    throw err;
  }
};

/**
 * Update a room type (admin operation)
 * @param {string} roomTypeId - Room type ID
 * @param {object} updateData - Fields to update
 * @returns {Promise<object|null>} Updated room type or null
 */
export const updateRoomTypeAdmin = async (roomTypeId, updateData) => {
  try {
    // Normalize update data: convert empty strings to null, ensure proper types
    const normalizedData = {
      code: updateData.code || null,
      name: updateData.name || null,
      description: updateData.description && updateData.description.trim() 
        ? updateData.description.trim() 
        : null,
      base_capacity: updateData.base_capacity !== undefined && updateData.base_capacity !== null && updateData.base_capacity !== ''
        ? parseInt(updateData.base_capacity)
        : null,
      max_person: updateData.max_person !== undefined && updateData.max_person !== null && updateData.max_person !== ''
        ? parseInt(updateData.max_person)
        : null,
      base_price: updateData.base_price !== undefined && updateData.base_price !== null && updateData.base_price !== ''
        ? parseFloat(updateData.base_price)
        : null,
      facilities: Array.isArray(updateData.facilities) ? updateData.facilities : [],
      hotel_rules: Array.isArray(updateData.hotel_rules) ? updateData.hotel_rules : [],
      cancellation_policy: updateData.cancellation_policy && updateData.cancellation_policy.trim()
        ? updateData.cancellation_policy.trim()
        : null,
      is_active: updateData.is_active !== undefined ? updateData.is_active : true,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(normalizedData).forEach(key => {
      if (normalizedData[key] === undefined) {
        delete normalizedData[key];
      }
    });

    const { data, error } = await supabase
      .from('room_types')
      .update(normalizedData)
      .eq('id', roomTypeId)
      .select();

    if (error) throw error;

    console.log(`✅ Room type ${roomTypeId} updated`);
    return data?.[0] || null;
  } catch (err) {
    console.error(`❌ Error updating room type:`, err);
    throw err;
  }
};

/**
 * Delete a room type (admin operation)
 * @param {string} roomTypeId - Room type ID
 * @returns {Promise<boolean>} Success or failure
 */
export const deleteRoomTypeAdmin = async (roomTypeId) => {
  try {
    const { error } = await supabase
      .from('room_types')
      .delete()
      .eq('id', roomTypeId);

    if (error) throw error;

    console.log(`✅ Room type ${roomTypeId} deleted`);
    return true;
  } catch (err) {
    console.error(`❌ Error deleting room type:`, err);
    throw err;
  }
};

// ============================================================================
// ROOMS MANAGEMENT - CRUD
// ============================================================================

/**
 * Fetch all rooms for admin with room type info
 * @returns {Promise<Array>} Array of rooms with room type data
 */
export const fetchRoomsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_types:room_type_id (id, code, name, base_price)
      `)
      .order('room_no', { ascending: true });

    if (error) throw error;

    console.log(`✅ Loaded ${data?.length || 0} rooms`);
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching rooms:', err);
    return [];
  }
};

/**
 * Create a new room
 * @param {object} roomData - Room data
 * @returns {Promise<object|null>} Created room or null
 */
export const createRoomAdmin = async (roomData) => {
  try {
    // Validation
    if (!roomData.room_no) {
      throw new Error('Room number is required');
    }
    if (!roomData.room_type_id) {
      throw new Error('Room type ID is required');
    }
    if (roomData.price !== undefined && roomData.price < 0) {
      throw new Error('Room price cannot be negative');
    }

    // Verify room type exists
    const { data: roomType, error: roomTypeError } = await supabase
      .from('room_types')
      .select('id')
      .eq('id', roomData.room_type_id)
      .single();

    if (roomTypeError || !roomType) {
      throw new Error('Invalid room type ID');
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert([{
        room_no: roomData.room_no,
        name: roomData.name || null,
        room_type_id: roomData.room_type_id,
        floor: roomData.floor || null,
        size: roomData.size || null,
        price: roomData.price || null,
        description: roomData.description || null,
        status: roomData.status || 'available',
      }])
      .select();

    if (error) {
      // Check if error is due to duplicate room_no
      if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
        throw new Error(`Room number ${roomData.room_no} already exists`);
      }
      throw error;
    }

    console.log(`✅ Room created: ${data?.[0]?.room_no}`);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error creating room:', err);
    throw err;
  }
};

/**
 * Update a room (admin operation)
 * @param {string} roomId - Room ID
 * @param {object} updateData - Fields to update
 * @returns {Promise<object|null>} Updated room or null
 */
export const updateRoomAdmin = async (roomId, updateData) => {
  try {
    // Normalize update data: convert empty strings to null, ensure proper types
    const normalizedData = {
      room_no: updateData.room_no || null,
      name: updateData.name || null,
      room_type_id: updateData.room_type_id || null,
      floor: updateData.floor !== undefined && updateData.floor !== null && updateData.floor !== '' 
        ? parseInt(updateData.floor) 
        : null,
      size: updateData.size !== undefined && updateData.size !== null && updateData.size !== ''
        ? parseInt(updateData.size)
        : null,
      price: updateData.price !== undefined && updateData.price !== null && updateData.price !== ''
        ? parseFloat(updateData.price)
        : null,
      description: updateData.description && updateData.description.trim() 
        ? updateData.description.trim() 
        : null,
      status: updateData.status || 'available',
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(normalizedData).forEach(key => {
      if (normalizedData[key] === undefined) {
        delete normalizedData[key];
      }
    });

    const { data, error } = await supabase
      .from('rooms')
      .update(normalizedData)
      .eq('id', roomId)
      .select();

    if (error) throw error;

    console.log(`✅ Room ${roomId} updated`);
    return data?.[0] || null;
  } catch (err) {
    console.error(`❌ Error updating room:`, err);
    throw err;
  }
};

/**
 * Delete a room (admin operation)
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} Success or failure
 */
export const deleteRoomAdmin = async (roomId) => {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;

    console.log(`✅ Room ${roomId} deleted`);
    return true;
  } catch (err) {
    console.error(`❌ Error deleting room:`, err);
    throw err;
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
      .from('users')
      .select('id, full_name, email, phone, is_admin, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map is_admin to role for compatibility
    const mappedData = (data || []).map(user => ({
      ...user,
      role: user.is_admin ? 'admin' : 'user'
    }));

    console.log(`✅ Loaded ${mappedData.length} users`);
    return mappedData;
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
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Map is_admin to role for compatibility
    if (data) {
      return {
        ...data,
        role: data.is_admin ? 'admin' : 'user'
      };
    }
    return null;
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
    // Map role back to is_admin if needed
    const updatePayload = { ...updateData };
    if (updatePayload.role !== undefined) {
      updatePayload.is_admin = updatePayload.role === 'admin';
      delete updatePayload.role;
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updatePayload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;

    const updated = data?.[0];
    if (updated) {
      return {
        ...updated,
        role: updated.is_admin ? 'admin' : 'user'
      };
    }
    
    console.log(`✅ User ${userId} profile updated`);
    return null;
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
      .from('users')
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
        users:user_id (id, full_name, email)
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
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_amount, status'),
      supabase.from('restaurant_bookings').select('total_price, status'),
      supabase.from('spa_bookings').select('total_price, status'),
    ]);

    // Calculate revenue - safely handle NaN
    // Calculate revenue - exclude cancelled and pending_payment bookings (only count paid bookings)
    const roomRevenue = (roomBookingsData.data || [])
      .reduce((sum, b) => {
        if (b.status === 'cancelled' || b.status === 'pending_payment') return sum; // Skip cancelled and unpaid bookings
        const amount = parseFloat(b.total_amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    const restRevenue = (restaurantBookingsData.data || [])
      .reduce((sum, b) => {
        if (b.status === 'cancelled' || b.status === 'pending_payment') return sum; // Skip cancelled and unpaid bookings
        const amount = parseFloat(b.total_price || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    const spaRevenue = (spaBookingsData.data || [])
      .reduce((sum, b) => {
        if (b.status === 'cancelled' || b.status === 'pending_payment') return sum; // Skip cancelled and unpaid bookings
        const amount = parseFloat(b.total_price || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

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
