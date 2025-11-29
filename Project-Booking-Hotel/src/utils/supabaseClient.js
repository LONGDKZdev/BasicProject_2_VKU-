import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// For Vite, use import.meta.env instead of process.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sxteddkozzqniebfstag.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dGVkZGtvenpxbmllYmZzdGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjQwMDgsImV4cCI6MjA3NzQ0MDAwOH0.FYblHTFrNTthvpcdGy6DFefjnApCe4qwcKZaHdkTiac';

// Debug log
console.log('🔐 Supabase URL:', SUPABASE_URL.substring(0, 30) + '...');

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetch all room types with amenities
 */
export const fetchRoomTypes = async () => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching room types:', err);
    return [];
  }
};

/**
 * Fetch all rooms (optionally filter by room_type_id)
 */
export const fetchRooms = async (roomTypeId = null) => {
  try {
    let query = supabase.from('rooms').select(`
      *,
      room_types:room_type_id (*)
    `);
    
    if (roomTypeId) {
      query = query.eq('room_type_id', roomTypeId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching rooms:', err);
    return [];
  }
};

/**
 * Fetch room images for room types
 */
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

/**
 * Fetch rooms with images (joined)
 * Images are fetched from Supabase Storage (hotel-rooms bucket)
 */
export const fetchRoomsWithImages = async () => {
  try {
    // Import here to avoid circular dependency
    const { getImageUrlsByRoomType } = await import('./supabaseStorageUrls.js');
    
    // Fetch rooms data
    const roomsData = await fetchRooms();

    // Build image URLs from room type codes
    // Mapping: STD→1, DLX→2, SUI→3, PEN→4, CMB→5
    const enrichedRooms = roomsData.map((room) => {
      const roomTypeCode = room.room_types?.code;
      const imageUrls = getImageUrlsByRoomType(roomTypeCode);
      
      // Debug log for first standard room
      if (room.room_no === 'STD-01') {
        console.log('🖼️ Room Images Debug:', {
          room_no: room.room_no,
          room_type_code: roomTypeCode,
          image_url: imageUrls.image_url,
          image_lg_url: imageUrls.image_lg_url,
        });
      }
      
      return {
        ...room,
        image_url: imageUrls.image_url || null,
        image_lg_url: imageUrls.image_lg_url || null,
        all_images: [imageUrls], // Store as array for consistency
      };
    });

    console.log(`✅ Loaded ${enrichedRooms.length} rooms from Supabase with Supabase Storage images`);
    return enrichedRooms;
  } catch (err) {
    console.error('Error fetching rooms with images:', err);
    return [];
  }
};

/**
 * Check room availability for date range
 */
export const checkRoomAvailability = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  try {
    let query = supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .neq('status', 'cancelled')
      .lt('check_in', checkOut)
      .gt('check_out', checkIn);
    
    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data && data.length === 0); // true if available (no conflicts)
  } catch (err) {
    console.error('Error checking availability:', err);
    return true; // fallback to available if error
  }
};

/**
 * Fetch price rules for a room type
 */
export const fetchPriceRules = async (roomTypeId) => {
  try {
    const { data, error } = await supabase
      .from('price_rules')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .eq('is_active', true)
      .order('priority', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching price rules:', err);
    return [];
  }
};

/**
 * Fetch active promotions
 */
export const fetchPromotions = async () => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .order('end_date', { ascending: true }); // Apply promotions ending soonest first, maybe? Or by priority field if available
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching promotions:', err);
    return [];
  }
};

/**
 * Create a booking
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
    console.error('Error creating booking:', err);
    return null;
  }
};

/**
 * Fetch bookings for a user
 */
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
    console.error('Error fetching user bookings:', err);
    return [];
  }
};

/**
 * Update booking status
 */
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
    console.error('Error updating booking:', err);
    return null;
  }
};

/**
 * Fetch reviews for a room type
 */
export const fetchRoomReviews = async (roomTypeId) => {
  try {
    const { data, error } = await supabase
      .from('room_reviews')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return [];
  }
};

/**
 * Create a room review
 */
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

/**
 * Check if user has booked a room type
 */
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
 * Create restaurant booking
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

/**
 * Update restaurant booking status
 */
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

/**
 * Fetch user restaurant bookings
 */
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
    console.error('Error fetching restaurant bookings:', err);
    return [];
  }
};

/**
 * Create spa booking
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

/**
 * Update spa booking status
 */
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

/**
 * Fetch user spa bookings
 */
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
    console.error('Error fetching spa bookings:', err);
    return [];
  }
};
