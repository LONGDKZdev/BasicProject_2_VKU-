# 🔄 Hướng Dẫn Đồng Bộ Dữ Liệu với Supabase - 100% Sync

**Mục tiêu:** Tất cả dữ liệu (bookings, reviews, restaurant, spa) sẽ được lưu vào Supabase thay vì chỉ localStorage.

---

## 📊 Tình Trạng Hiện Tại

### ✅ Đã Hoạt Động
- Rooms & Images: Lấy từ Supabase ✓
- Fallback: Dùng localStorage khi offline ✓
- Database Schema: Đã setup đầy đủ ✓

### ❌ Chưa Hoạt Động
- Bookings: Lưu vào localStorage, không sync Supabase
- Reviews: Lưu vào localStorage, không sync Supabase
- Restaurant Bookings: Lưu vào localStorage, không sync Supabase
- Spa Bookings: Lưu vào localStorage, không sync Supabase

---

## 🎯 Giải Pháp

Bạn cần chỉnh sửa code frontend để:
1. Lưu dữ liệu vào Supabase trước
2. Fallback vào localStorage nếu offline
3. Sync lại khi online

---

## 📝 Bước 1: Cập nhật supabaseClient.js

Thêm các functions để lưu bookings, reviews, restaurant/spa bookings:

```javascript
// src/utils/supabaseClient.js

// ==================== BOOKINGS ====================

/**
 * Create a booking in Supabase
 */
export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: bookingData.userId,
        confirmation_code: bookingData.confirmationCode,
        booking_type: 'room',
        status: bookingData.status || 'pending_payment',
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        room_id: bookingData.roomId,
        room_name: bookingData.roomName,
        user_name: bookingData.userName,
        user_email: bookingData.userEmail,
        num_adults: bookingData.adults || 1,
        num_children: bookingData.kids || 0,
        total_nights: bookingData.totalNights || 1,
        subtotal: bookingData.totalPrice || 0,
        total_amount: bookingData.totalPrice || 0,
        pricing_breakdown: bookingData.pricingBreakdown || [],
        note: bookingData.note || '',
        payment_method: bookingData.paymentMethod || null,
        paid_at: bookingData.paidAt || null,
      }])
      .select();
    
    if (error) throw error;
    console.log('✅ Booking saved to Supabase:', data?.[0]);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error creating booking:', err);
    return null;
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status, extraData = {}) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        ...extraData,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    
    if (error) throw error;
    console.log('✅ Booking updated:', data?.[0]);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error updating booking:', err);
    return null;
  }
};

/**
 * Fetch user bookings
 */
export const fetchUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .eq('booking_type', 'room')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    console.log('✅ User bookings fetched:', data?.length);
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching user bookings:', err);
    return [];
  }
};

// ==================== REVIEWS ====================

/**
 * Create a room review
 */
export const createReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('room_reviews')
      .insert([{
        room_type_id: reviewData.roomTypeId,
        user_id: reviewData.userId,
        user_name: reviewData.userName,
        user_email: reviewData.userEmail,
        rating: reviewData.rating,
        comment: reviewData.comment,
        stay_date: reviewData.stayDate || null,
      }])
      .select();
    
    if (error) throw error;
    console.log('✅ Review saved to Supabase:', data?.[0]);
    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error creating review:', err);
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
    console.log('✅ Reviews fetched:', data?.length);
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching reviews:', err);
    return [];
  }
};

// ==================== RESTAURANT BOOKINGS ====================

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
    console.log('✅ Restaurant booking saved:', data?.[0]);
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
    console.log('✅ Restaurant booking updated:', data?.[0]);
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
    console.log('✅ User restaurant bookings fetched:', data?.length);
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching restaurant bookings:', err);
    return [];
  }
};

// ==================== SPA BOOKINGS ====================

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
    console.log('✅ Spa booking saved:', data?.[0]);
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
    console.log('✅ Spa booking updated:', data?.[0]);
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
    console.log('✅ User spa bookings fetched:', data?.length);
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching spa bookings:', err);
    return [];
  }
};
```

---

## 📝 Bước 2: Cập nhật RoomContext.jsx

Sửa hàm `bookRoom` để lưu vào Supabase:

```javascript
// src/context/RoomContext.jsx

import {
  createBooking,
  updateBookingStatus,
  fetchUserBookings,
  createReview,
  fetchRoomReviews,
  // ... other imports
} from '../utils/supabaseClient';

// ... existing code ...

const bookRoom = ({
  roomId,
  roomName,
  userId,
  userName,
  userEmail,
  checkIn,
  checkOut,
  adults: bookingAdults,
  kids: bookingKids,
  note,
}) => {
  const room = getRoomById(roomId);
  if (!room) {
    return { success: false, error: "Room not found" };
  }
  if (!checkIn || !checkOut) {
    return {
      success: false,
      error: "Please select check-in and check-out dates",
    };
  }
  if (!isRoomAvailable(roomId, checkIn, checkOut)) {
    return {
      success: false,
      error: "Room is not available for the selected dates",
    };
  }

  const normalizedCheckIn = normalizeDateInput(checkIn);
  const normalizedCheckOut = normalizeDateInput(checkOut);

  const { total, breakdown } = calculatePricingForRoom(
    room,
    normalizedCheckIn,
    normalizedCheckOut
  );
  const confirmationCode = `AD-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;

  // Prepare booking object
  const newBooking = {
    confirmationCode,
    userId,
    userName,
    userEmail,
    roomId,
    roomName,
    checkIn: normalizedCheckIn,
    checkOut: normalizedCheckOut,
    adults: bookingAdults,
    kids: bookingKids,
    note,
    status: "pending_payment",
    totalNights: breakdown.length,
    totalPrice: total,
    pricingBreakdown: breakdown,
    createdAt: new Date().toISOString(),
  };

  // ✅ SAVE TO SUPABASE FIRST
  if (dbConnected) {
    createBooking(newBooking).then((dbBooking) => {
      if (dbBooking) {
        // Transform DB response to frontend format
        const frontendBooking = {
          id: dbBooking.id,
          confirmationCode: dbBooking.confirmation_code,
          roomId: dbBooking.room_id,
          roomName: dbBooking.room_name,
          userId: dbBooking.user_id,
          userEmail: dbBooking.user_email,
          userName: dbBooking.user_name,
          checkIn: dbBooking.check_in,
          checkOut: dbBooking.check_out,
          adults: dbBooking.num_adults,
          kids: dbBooking.num_children,
          totalNights: dbBooking.total_nights,
          totalPrice: parseFloat(dbBooking.total_amount),
          pricingBreakdown: dbBooking.pricing_breakdown,
          note: dbBooking.note,
          status: dbBooking.status,
          type: "room",
          createdAt: dbBooking.created_at,
        };
        // Update local state with DB response
        saveBookings((prev) => [frontendBooking, ...prev]);
        console.log('✅ Booking synced to Supabase:', frontendBooking.confirmationCode);
      }
    }).catch((err) => {
      console.error('❌ Failed to save to Supabase:', err);
      // Fallback to localStorage
      const fallbackBooking = {
        id: createId(),
        ...newBooking,
        type: "room",
      };
      saveBookings((prev) => [fallbackBooking, ...prev]);
    });
  } else {
    // Offline: save to localStorage only
    const fallbackBooking = {
      id: createId(),
      ...newBooking,
      type: "room",
    };
    saveBookings((prev) => [fallbackBooking, ...prev]);
  }

  return {
    success: true,
    booking: {
      id: "pending",
      confirmationCode,
      roomId,
      roomName,
      userId,
      userEmail,
      userName,
      checkIn: normalizedCheckIn,
      checkOut: normalizedCheckOut,
      adults: bookingAdults,
      kids: bookingKids,
      totalNights: breakdown.length,
      totalPrice: total,
      pricingBreakdown: breakdown,
      note,
      status: "pending_payment",
      type: "room",
      createdAt: new Date().toISOString(),
    },
  };
};

// ✅ Update confirmBookingPayment to sync with Supabase
const confirmBookingPayment = (bookingId, paymentData) => {
  let confirmedBooking = null;
  saveBookings((prev) =>
    prev.map((booking) => {
      if (booking.id !== bookingId) return booking;
      confirmedBooking = {
        ...booking,
        ...paymentData,
        status: "confirmed",
        paidAt: paymentData.paidAt || new Date().toISOString(),
      };

      // ✅ SYNC TO SUPABASE
      if (dbConnected && booking.id !== "pending") {
        updateBookingStatus(booking.id, "confirmed", {
          payment_method: paymentData.paymentMethod,
          payment_code: paymentData.paymentCode,
          paid_at: confirmedBooking.paidAt,
        }).catch((err) => {
          console.error('❌ Failed to update Supabase:', err);
        });
      }

      // Send confirmation email
      if (isBookingEmailConfigured()) {
        sendBookingConfirmationEmail({
          toEmail: booking.userEmail,
          toName: booking.userName,
          booking: confirmedBooking,
        });
      }

      return confirmedBooking;
    })
  );
  return confirmedBooking;
};

// ✅ Update cancelBooking to sync with Supabase
const cancelBooking = (bookingId, reason = "Cancelled by guest") => {
  let cancelledBooking = null;
  saveBookings((prev) =>
    prev.map((booking) => {
      if (booking.id !== bookingId) return booking;
      cancelledBooking = {
        ...booking,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelReason: reason,
      };

      // ✅ SYNC TO SUPABASE
      if (dbConnected && booking.id !== "pending") {
        updateBookingStatus(booking.id, "cancelled", {
          note: reason,
        }).catch((err) => {
          console.error('❌ Failed to update Supabase:', err);
        });
      }

      return cancelledBooking;
    })
  );
  return cancelledBooking;
};

// ✅ Update addReview to sync with Supabase
const addReview = (roomId, review) => {
  // Optimistically update UI
  setAllRooms((prevRooms) => {
    const updatedRooms = prevRooms.map((room) =>
      room.id === roomId
        ? { ...room, reviews: [review, ...(room.reviews || [])] }
        : room
    );
    persistReviews(updatedRooms);
    setRooms(filterRooms({ sourceRooms: updatedRooms }));
    return updatedRooms;
  });

  // ✅ SAVE TO SUPABASE
  if (dbConnected) {
    createReview({
      roomTypeId: roomId,
      userId: review.userId,
      userName: review.userName,
      userEmail: review.userEmail,
      rating: review.rating,
      comment: review.comment,
      stayDate: review.stayDate || null,
    }).catch((err) => {
      console.error('❌ Error saving review to Supabase:', err);
    });
  }
};
```

---

## 📝 Bước 3: Cập nhật BookingContext.jsx

Sửa để lưu restaurant & spa bookings vào Supabase:

```javascript
// src/context/BookingContext.jsx

import {
  createRestaurantBooking,
  updateRestaurantBookingStatus,
  fetchUserRestaurantBookings,
  createSpaBooking,
  updateSpaBookingStatus,
  fetchUserSpaBookings,
} from '../utils/supabaseClient';

// ... existing code ...

const createRestaurantBooking = (bookingData) => {
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
  supabaseCreateRestaurantBooking({
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
    supabaseUpdateRestaurantBookingStatus(booking.id, 'confirmed', {
      payment_method: paymentData.paymentMethod,
      payment_code: paymentData.paymentCode,
      paid_at: confirmedBooking.paidAt,
    }).catch((err) => {
      console.error('❌ Failed to update Supabase:', err);
    });

    // Send email
    sendBookingConfirmationEmail({
      toEmail: booking.email || booking.userEmail,
      toName: booking.name || booking.userName,
      booking: confirmedBooking
    });

    return confirmedBooking;
  }));
  return confirmedBooking;
};

// Similar updates for SPA bookings...
const createSpaBooking = (bookingData) => {
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
  supabaseCreateSpaBooking({
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
```

---

## 🔐 Bước 4: Kiểm Tra RLS Policies

Đảm bảo RLS policies cho phép users lưu dữ liệu:

```sql
-- Chạy trên Supabase SQL Editor

-- BOOKINGS: users có thể insert/update bookings của họ
create policy "bookings_user_insert" on public.bookings
for insert with check (auth.uid() = user_id);

create policy "bookings_user_update" on public.bookings
for update using (auth.uid() = user_id);

-- RESTAURANT BOOKINGS: users có thể insert/update
create policy "restaurant_bookings_user_insert" on public.restaurant_bookings
for insert with check (auth.uid() = user_id);

create policy "restaurant_bookings_user_update" on public.restaurant_bookings
for update using (auth.uid() = user_id);

-- SPA BOOKINGS: users có thể insert/update
create policy "spa_bookings_user_insert" on public.spa_bookings
for insert with check (auth.uid() = user_id);

create policy "spa_bookings_user_update" on public.spa_bookings
for update using (auth.uid() = user_id);

-- REVIEWS: users có thể insert reviews
create policy "reviews_user_insert" on public.room_reviews
for insert with check (auth.uid() = user_id);
```

---

## 🧪 Bước 5: Testing

### Test Booking Creation
```javascript
// Mở DevTools (F12) → Console

// 1. Tạo booking
const bookingResult = await bookRoom({
  roomId: 'room-uuid',
  roomName: 'Standard Room',
  userId: 'user-uuid',
  userName: 'John Doe',
  userEmail: 'john@example.com',
  checkIn: '2025-01-15',
  checkOut: '2025-01-20',
  adults: 2,
  kids: 0,
  note: 'Test booking'
});

// 2. Kiểm tra Supabase
// Vào Supabase Dashboard → Table Editor → bookings
// Nên thấy booking mới được tạo

// 3. Kiểm tra localStorage (backup)
console.log(JSON.parse(localStorage.getItem('hotel_bookings')));
```

### Test Review Creation
```javascript
// 1. Thêm review
addReview('room-uuid', {
  userId: 'user-uuid',
  userName: 'John Doe',
  userEmail: 'john@example.com',
  rating: 5,
  comment: 'Great room!',
  createdAt: new Date().toISOString()
});

// 2. Kiểm tra Supabase
// Dashboard → Table Editor → room_reviews
```

---

## 📋 Checklist Hoàn Thành

- [ ] Cập nhật supabaseClient.js với các functions mới
- [ ] Cập nhật RoomContext.jsx để lưu bookings vào Supabase
- [ ] Cập nhật BookingContext.jsx để lưu restaurant/spa vào Supabase
- [ ] Kiểm tra RLS policies
- [ ] Test booking creation
- [ ] Test review creation
- [ ] Test restaurant booking
- [ ] Test spa booking
- [ ] Kiểm tra Supabase Dashboard
- [ ] Kiểm tra console logs
- [ ] Test offline mode (fallback)

---

## 🔍 Debugging

### Nếu dữ liệu không lưu vào Supabase:

1. **Kiểm tra console logs**
   ```
   F12 → Console → Tìm ❌ hoặc ✅ logs
   ```

2. **Kiểm tra RLS policies**
   ```
   Supabase Dashboard → Authentication → Policies
   Đảm bảo có INSERT/UPDATE policies
   ```

3. **Kiểm tra user authentication**
   ```
   console.log(supabase.auth.getSession());
   Nên có user object
   ```

4. **Kiểm tra network requests**
   ```
   F12 → Network → Tìm POST requests
   Nên thấy requests tới Supabase
   ```

---

## ✅ Kết Quả Mong Đợi

Sau khi hoàn thành:
- ✅ Bookings lưu vào Supabase
- ✅ Reviews lưu vào Supabase
- ✅ Restaurant bookings lưu vào Supabase
- ✅ Spa bookings lưu vào Supabase
- ✅ Fallback vào localStorage khi offline
- ✅ Sync lại khi online
- ✅ 100% đồng bộ dữ liệu

---

## 🚀 Bước Tiếp Theo

1. Implement các thay đổi trên
2. Test tất cả flows
3. Kiểm tra Supabase Dashboard
4. Xóa dữ liệu test nếu cần
5. Deploy lên production

---

*Hướng dẫn được tạo: Nov 23, 2025*
