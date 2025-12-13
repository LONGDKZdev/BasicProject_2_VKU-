import { supabase } from '../utils/supabaseClient';

/**
 * Service layer for room and pricing operations
 */

export const fetchRoomTypes = async () => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('is_active', true)
      .order('code', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching room types:', err);
    return [];
  }
};

export const createRoomType = async (roomTypeData) => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .insert([roomTypeData])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating room type:', err);
    throw err;
  }
};

export const updateRoomType = async (id, roomTypeData) => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .update(roomTypeData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating room type:', err);
    throw err;
  }
};

export const deleteRoomType = async (id) => {
  try {
    const { error } = await supabase
      .from('room_types')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting room type:', err);
    throw err;
  }
};

export const fetchRooms = async (roomTypeId = null) => {
  try {
    let query = supabase.from('rooms').select(`
      *,
      room_types:room_type_id (*)
    `);
    
    if (roomTypeId) {
      query = query.eq('room_type_id', roomTypeId);
    }
    
    const { data, error } = await query.order('room_no', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching rooms:', err);
    return [];
  }
};

export const createRoom = async (roomData) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select(`*, room_types:room_type_id (*)`);
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating room:', err);
    throw err;
  }
};

export const updateRoom = async (id, roomData) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', id)
      .select(`*, room_types:room_type_id (*)`);
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating room:', err);
    throw err;
  }
};

export const deleteRoom = async (id) => {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting room:', err);
    throw err;
  }
};

export const fetchRoomImages = async (roomTypeId = null) => {
  try {
    let query = supabase.from('room_images').select('*');
    
    if (roomTypeId) {
      query = query.eq('room_type_id', roomTypeId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    console.log('🖼️ Fetch Room Images - Result:', { count: data?.length, data });
    
    return data || [];
  } catch (err) {
    console.error('Error fetching room images:', err);
    return [];
  }
};

export const fetchRoomsWithImages = async () => {
  try {
    // 1. Fetch all rooms with their room_type relations
    const roomsData = await fetchRooms();

    // 2. For each room, fetch its room_type's images from room_images table
    const enrichedRooms = await Promise.all(
      roomsData.map(async (room) => {
        const roomTypeId = room.room_type_id;
        
        try {
          // Fetch images for this room type from Supabase
          const images = await fetchRoomImages(roomTypeId);
          
          // Get primary image (first one) and lg variant
          const primaryImage = images?.length > 0 ? images[0] : null;
          
          return {
            ...room,
            image_url: primaryImage?.image_url || null,
            image_lg_url: primaryImage?.image_lg_url || null,
            all_images: images || [],
          };
        } catch (imgErr) {
          console.warn(`Failed to load images for room type ${roomTypeId}:`, imgErr);
          return {
            ...room,
            image_url: null,
            image_lg_url: null,
            all_images: [],
          };
        }
      })
    );

    console.log(`✅ Loaded ${enrichedRooms.length} rooms from Supabase with real Storage images`);
    return enrichedRooms;
  } catch (err) {
    console.error('Error fetching rooms with images:', err);
    return [];
  }
};

/**
 * Fetch available rooms for a given date range and guest count
 * @param {string} checkIn - ISO date string
 * @param {string} checkOut - ISO date string
 * @param {number} guests - Number of guests
 * @returns {Promise<Array>} Array of available rooms with pricing
 */
export const fetchAvailableRooms = async (checkIn, checkOut, guests = 1) => {
  try {
    // Fetch all active rooms
    const rooms = await fetchRooms();
    
    // Filter rooms by capacity
    const capacityFiltered = rooms.filter(room => {
      const roomType = room.room_type;
      const baseCapacity = roomType?.base_capacity || 2;
      return baseCapacity >= guests;
    });

    // Check availability for each room
    const availabilityPromises = capacityFiltered.map(async (room) => {
      const isAvailable = await checkRoomAvailability(room.id, checkIn, checkOut);
      return { ...room, available: isAvailable };
    });

    const roomsWithAvailability = await Promise.all(availabilityPromises);
    
    // Filter only available rooms and format for AvailabilityViewer
    const availableRooms = roomsWithAvailability
      .filter(room => room.available && room.status === 'available')
      .map(room => ({
        id: room.id,
        name: room.room_no, // For AvailabilityViewer display
        type: room.room_type?.name || 'N/A',
        capacity: room.room_type?.base_capacity || 2,
        price: room.price || 0,
        status: room.status,
      }));

    return availableRooms;
  } catch (err) {
    console.error('Error fetching available rooms:', err);
    return [];
  }
};

export const checkRoomAvailability = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  try {
    // Calculate cutoff time: pending_payment bookings older than 15 minutes are considered expired
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    let query = supabase
      .from('bookings')
      .select('id, status, created_at')
      .eq('room_id', roomId)
      .neq('status', 'cancelled')
      .lt('check_in', checkOut)
      .gt('check_out', checkIn);
    
    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return true; // No bookings found, room is available
    }
    
    // Filter out bookings that don't block availability:
    // 1. confirmed or checked_in bookings (always block)
    // 2. pending_payment bookings that are recent (within 15 minutes) - block
    // 3. pending_payment bookings older than 15 minutes - don't block (expired)
    // 4. cancelled bookings - don't block (already filtered in query)
    const blockingBookings = data.filter(booking => {
      if (booking.status === 'confirmed' || booking.status === 'checked_in') {
        return true; // Always block
      }
      
      if (booking.status === 'pending_payment') {
        // Only block if created within last 15 minutes
        const createdAt = new Date(booking.created_at);
        const cutoffTime = new Date(fifteenMinutesAgo);
        return createdAt > cutoffTime;
      }
      
      // Other statuses (e.g., 'checked_out') don't block
      return false;
    });
    
    // If no blocking bookings found, room is available
    return blockingBookings.length === 0;
  } catch (err) {
    console.error('Error checking availability:', err);
    return true; // On error, assume room is available (safer for user experience)
  }
};

export const fetchPriceRules = async (roomTypeId = null) => {
  try {
    let query = supabase
      .from('price_rules')
      .select('*')
      .eq('is_active', true);
    
    // Chỉ filter theo room_type_id nếu có giá trị hợp lệ
    if (roomTypeId) {
      query = query.eq('room_type_id', roomTypeId);
    }
    
    const { data, error } = await query.order('priority', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching price rules:', err);
    return [];
  }
};

export const fetchPromotions = async () => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .order('end_date', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching promotions:', err);
    return [];
  }
};

export const fetchHolidayCalendar = async () => {
  try {
    const { data, error } = await supabase
      .from('holiday_calendar')
      .select('*')
      .eq('is_active', true)
      .order('holiday_date', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching holiday calendar:', err);
    return [];
  }
};

export const fetchRoomReviews = async (roomId = null, roomTypeId = null) => {
  try {
    let query = supabase.from('room_reviews').select('*');
    
    // Ưu tiên fetch theo room_id cụ thể, fallback về room_type_id nếu không có room_id
    if (roomId) {
      query = query.eq('room_id', roomId);
    } else if (roomTypeId) {
      query = query.eq('room_type_id', roomTypeId);
    } else {
      return [];
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return [];
  }
};

export const createReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('room_reviews')
      .insert([reviewData])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating review:', err);
    return null;
  }
};

export const hasUserBookedRoomType = async (userId, roomTypeId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', userId)
      .eq('room_type_id', roomTypeId)
      .neq('status', 'cancelled')
      .limit(1);
    if (error) throw error;
    return (data && data.length > 0);
  } catch (err) {
    console.error('Error checking user booking:', err);
    return false;
  }
};

/**
 * Get primary image for a room type
 * @param {string} roomTypeId - Room type UUID
 * @returns {object|null} Image object with image_url and image_lg_url, or null
 */
export const getPrimaryImage = async (roomTypeId) => {
  try {
    const { data, error } = await supabase
      .from('room_images')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .order('display_order', { ascending: true })
      .limit(1);
    
    if (error) throw error;
    return data?.length > 0 ? data[0] : null;
  } catch (err) {
    console.error(`Error fetching primary image for room type ${roomTypeId}:`, err);
    return null;
  }
};

/**
 * Get all images for a room type
 * @param {string} roomTypeId - Room type UUID
 * @returns {array} Array of image objects
 */
export const getAllImages = async (roomTypeId) => {
  try {
    const { data, error } = await supabase
      .from('room_images')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error fetching all images for room type ${roomTypeId}:`, err);
    return [];
  }
};

/**
 * Room status board (view) + history helpers
 */
export const fetchRoomStatusBoard = async () => {
  try {
    const { data, error } = await supabase
      .from('room_status_board')
      .select('*')
      .order('room_no', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching room status board:', err);
    return [];
  }
};

export const addRoomStatusHistory = async ({ roomId, status, note = null, actor = null }) => {
  try {
    const payload = {
      room_id: roomId,
      status,
      note,
      actor,
      started_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('room_status_history')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error adding room status history:', err);
    return null;
  }
};

export const updateRoomStatus = async (roomId, status) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', roomId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating room status:', err);
    return null;
  }
};

export default {
  fetchRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  fetchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  fetchRoomImages,
  fetchRoomsWithImages,
  fetchAvailableRooms,
  checkRoomAvailability,
  fetchPriceRules,
  fetchPromotions,
  fetchHolidayCalendar,
  fetchRoomReviews,
  createReview,
  hasUserBookedRoomType,
  getPrimaryImage,
  getAllImages,
};