import { ScrollToTop, Toast } from '../components';
import QRPayment from '../components/QRPayment';
import Invoice from '../components/Invoice';
import { useRoomContext } from '../context/RoomContext';
import { useAuth } from '../context/SimpleAuthContext';
import { hotelRules } from '../constants/data';
import { useParams, Link } from 'react-router-dom';
import {
  FaCheck,
  FaStar,
  FaWifi,
  FaDumbbell,
  FaSwimmingPool,
  FaUtensils,
  FaCar,
  FaSnowflake,
} from 'react-icons/fa';
import { useMemo, useState, useEffect } from 'react';
import { fetchRoomReviews, createReview } from '../services/roomService';
import { supabase } from '../utils/supabaseClient';

// Placeholder image - will be replaced by Supabase Storage URL
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23ddd' width='800' height='600'/%3E%3Ctext x='50%' y='50%' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ELoading image...%3C/text%3E%3C/svg%3E";

// Map facility name -> icon (purely visual, không thay đổi layout)
const getFacilityIcon = (rawName) => {
  const name = (typeof rawName === 'string' ? rawName : rawName?.name || '').toLowerCase();

  if (name.includes('wifi') || name.includes('wi-fi')) return <FaWifi className="text-3xl text-accent" />;
  if (name.includes('gym') || name.includes('fitness')) return <FaDumbbell className="text-3xl text-accent" />;
  if (name.includes('pool') || name.includes('swim')) return <FaSwimmingPool className="text-3xl text-accent" />;
  if (name.includes('restaurant') || name.includes('breakfast') || name.includes('dining'))
    return <FaUtensils className="text-3xl text-accent" />;
  if (name.includes('parking') || name.includes('car')) return <FaCar className="text-3xl text-accent" />;
  if (name.includes('air') || name.includes('conditioning') || name.includes('ac'))
    return <FaSnowflake className="text-3xl text-accent" />;

  return <FaCheck className="text-3xl text-accent" />;
};

const createLocalId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString();
};

const RoomDetails = () => {
  // Lấy parameter từ URL - route là /room/:id nên dùng 'id'
  const params = useParams();
  const roomNo = params.id || params.roomNo; // Route dùng :id, nhưng hỗ trợ cả roomNo
  
  const {
    allRooms,
    bookRoom,
    confirmBookingPayment,
    hasUserBookedRoom,
    calculatePricingForRoom,
    getUserBookings,
    cancelBooking,
    promotions,
  } = useRoomContext();
  const { user, isAuthenticated } = useAuth();

  // Tìm room theo room_no (URL dùng roomNo như "CMB-02", không phải UUID)
  const room = allRooms.find(roomItem => {
    // Ưu tiên match theo roomNo (string như "STD-01" hoặc "CMB-02")
    if (roomItem.roomNo === roomNo || roomItem.room_no === roomNo) {
      return true;
    }
    // Fallback: Match theo id (UUID) nếu roomNo không match
    if (roomItem.id === roomNo) {
      return true;
    }
    return false;
  });
  
  // Debug log để kiểm tra
  useEffect(() => {
    console.log('🔍 RoomDetails Debug:', {
      params: params,
      roomNoFromURL: roomNo,
      allRoomsCount: allRooms.length,
      foundRoom: room ? {
        id: room.id,
        roomNo: room.roomNo,
        room_no: room.room_no,
        name: room.name,
        price: room.price
      } : null,
      firstFewRooms: allRooms.slice(0, 5).map(r => ({
        id: r.id,
        roomNo: r.roomNo,
        room_no: r.room_no,
        name: r.name
      })),
      allCMBRooms: allRooms.filter(r => r.roomNo?.startsWith('CMB-') || r.room_no?.startsWith('CMB-')).map(r => ({
        id: r.id,
        roomNo: r.roomNo,
        room_no: r.room_no,
        name: r.name
      }))
    });
  }, [params, roomNo, allRooms, room]);

  const [reservation, setReservation] = useState({
    checkIn: '',
    checkOut: '',
    adults: 2,
    kids: 0,
    note: '',
    promoCode: '', // New field for promotion code
    guestName: '', // For guest bookings
    guestEmail: '', // For guest bookings
    guestPhone: '', // For guest bookings
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [toast, setToast] = useState(null);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [promoValidation, setPromoValidation] = useState({ isValid: null, message: '' });

  const maxGuests = room?.maxPerson || 1;

  const nights = useMemo(() => {
    if (!reservation.checkIn || !reservation.checkOut) return 1;
    const start = new Date(reservation.checkIn);
    const end = new Date(reservation.checkOut);
    const diff = end.getTime() - start.getTime();
    const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return Number.isFinite(days) ? days : 1;
  }, [reservation.checkIn, reservation.checkOut]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return null;
    const score = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return score.toFixed(1);
  }, [reviews]);

  if (!room) {
    return (
      <section className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-xl text-primary/70 mb-4'>Không tìm thấy phòng với mã: {roomNo}</p>
          <Link to='/rooms' className='btn btn-secondary'>Xem danh sách phòng</Link>
        </div>
      </section>
    );
  }

  const totalGuests = reservation.adults + reservation.kids;
  const pricingPreview = useMemo(() => {
    if (!room || !reservation.checkIn || !reservation.checkOut) {
      console.log('⚠️ RoomDetails: Cannot calculate pricing - missing data', {
        hasRoom: !!room,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut
      });
      return null;
    }
    const preview = calculatePricingForRoom(room, reservation.checkIn, reservation.checkOut);
    console.log('💰 RoomDetails: Pricing calculated:', {
      roomId: room.id,
      roomNo: room.roomNo,
      roomPrice: room.price,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights,
      preview
    });
    return preview;
  }, [room, reservation.checkIn, reservation.checkOut, calculatePricingForRoom, nights]);
  const totalPrice = pricingPreview?.total ?? (nights * (room?.price || 0));

  // Load existing reviews for this specific room from Supabase
  useEffect(() => {
    let isMounted = true;
    let subscription = null;

    const loadReviews = async () => {
      if (!room?.id) {
        console.log('⚠️ RoomDetails: Cannot load reviews - room.id is missing', { room });
        return;
      }
      
      console.log('📝 RoomDetails: Loading reviews for room:', {
        roomId: room.id,
        roomNo: room.roomNo,
        roomName: room.name
      });
      
      // Fetch reviews: CHỈ fetch theo room_id cụ thể (không fallback về room_type_id)
      // để đảm bảo mỗi phòng có reviews riêng
      try {
        // CHỈ fetch theo room_id cụ thể
        const data = await fetchRoomReviews(room.id, null);
        
        console.log('📝 RoomDetails: Fetched reviews:', {
          roomId: room.id,
          roomNo: room.roomNo,
          reviewCount: data?.length || 0,
          reviews: data
        });
        
        if (!isMounted) return;
        
        const normalized = (data || []).map((r) => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          userEmail: r.user_email,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.created_at,
          stayDate: r.stay_date,
        }));
        setReviews(normalized);
        console.log('✅ RoomDetails: Reviews loaded successfully:', normalized.length);
      } catch (error) {
        console.error('❌ RoomDetails: Error loading reviews:', error);
        setReviews([]); // Set empty array on error
      }
    };

    // Load reviews lần đầu
    loadReviews();

    // Setup Supabase Realtime subscription để tự động update khi có review mới
    if (room?.id) {
      try {
        subscription = supabase
          .channel(`room_reviews:${room.id}`)
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'room_reviews',
              filter: `room_id=eq.${room.id}`, // Chỉ listen reviews của phòng này
            },
            (payload) => {
              console.log('🔄 RoomDetails: Realtime update received:', payload);
              
              if (!isMounted) return;
              
              // Reload reviews khi có thay đổi
              loadReviews();
            }
          )
          .subscribe((status) => {
            console.log('📡 RoomDetails: Realtime subscription status:', status);
          });
      } catch (realtimeError) {
        console.warn('⚠️ RoomDetails: Realtime subscription failed, using polling fallback:', realtimeError);
        
        // Fallback: Polling mỗi 10 giây nếu Realtime không hoạt động
        const pollInterval = setInterval(() => {
          if (isMounted) {
            loadReviews();
          }
        }, 10000); // 10 seconds
        
        return () => {
          isMounted = false;
          clearInterval(pollInterval);
        };
      }
    }

    return () => {
      isMounted = false;
      // Unsubscribe khi component unmount
      if (subscription) {
        supabase.removeChannel(subscription);
        console.log('🔌 RoomDetails: Realtime subscription removed');
      }
    };
  }, [room?.id]);

  // Với yêu cầu hiện tại: chỉ cần đăng nhập là có thể bình luận
  // (không bắt buộc phải có booking trước đó)

  const showToast = (payload) => {
    setToast(payload);
    setTimeout(() => setToast(null), 4000);
  };

  const handleReservationChange = (field, value) => {
    setReservation(prev => ({ ...prev, [field]: value }));
  };

  const validateBooking = () => {
    // Check dates
    if (!reservation.checkIn || !reservation.checkOut) {
      showToast({ type: 'error', message: 'Select both check-in and check-out dates.' });
      return false;
    }
    const checkInDate = new Date(reservation.checkIn);
    const checkOutDate = new Date(reservation.checkOut);
    
    // Validate dates are valid
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      showToast({ type: 'error', message: 'Invalid date format. Please select valid dates.' });
      return false;
    }
    
    if (checkOutDate <= checkInDate) {
      showToast({ type: 'error', message: 'Check-out must be after check-in.' });
      return false;
    }
    if (totalGuests > maxGuests) {
      showToast({ type: 'error', message: `This category hosts up to ${maxGuests} guests.` });
      return false;
    }
    
    // Check authentication or guest info
    if (!isAuthenticated()) {
      // Guest booking: require guest information
      if (!reservation.guestName || !reservation.guestName.trim()) {
        showToast({ type: 'error', message: 'Please provide your name for guest booking.' });
        return false;
      }
      if (!reservation.guestEmail || !reservation.guestEmail.trim()) {
        showToast({ type: 'error', message: 'Please provide your email for guest booking.' });
        return false;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reservation.guestEmail)) {
        showToast({ type: 'error', message: 'Please provide a valid email address.' });
        return false;
      }
    }
    
    return true;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!validateBooking()) return;

    // Determine if this is a guest booking or authenticated booking
    const isGuestBooking = !isAuthenticated();
    
    try {
      const result = await bookRoom({
      roomId: room.id,
      roomName: room.name,
      userId: isGuestBooking ? null : user?.id, // null for guest bookings
      userName: isGuestBooking ? reservation.guestName : (user?.name || user?.email?.split('@')[0]),
      userEmail: isGuestBooking ? reservation.guestEmail : user?.email,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      adults: reservation.adults,
      kids: reservation.kids,
      note: reservation.note,
      promoCode: reservation.promoCode,
      // Guest booking fields
      guestName: isGuestBooking ? reservation.guestName : null,
      guestEmail: isGuestBooking ? reservation.guestEmail : null,
      guestPhone: isGuestBooking ? reservation.guestPhone : null,
    });

    if (result?.success) {
      setCurrentBooking(result.booking);
      setShowQRPayment(true);
      
      // Show promo error as warning if booking succeeded but promo failed
      if (result.promoError) {
        showToast({
          type: 'warning',
          message: result.promoError + '. Booking created without promotion.',
        });
      }
    } else {
      showToast({
        type: 'error',
        message: result?.error || 'Unable to complete booking. Please try another selection.',
        });
      }
    } catch (err) {
      console.error('Booking error:', err);
      showToast({
        type: 'error',
        message: err.message || 'Unable to complete booking. Please try another selection.',
      });
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    if (!currentBooking) return;
    
    const confirmedBooking = confirmBookingPayment(currentBooking.id, paymentData);
    setCurrentBooking(confirmedBooking);
    setShowQRPayment(false);
    setShowInvoice(true);
    showToast({
      type: 'success',
      message: 'Payment successful! Your booking is confirmed.',
    });
    setReservation(prev => ({ ...prev, note: '' }));
  };

  const handleCloseQRPayment = async () => {
    // If booking exists and payment was not completed, cancel the booking
    if (currentBooking && currentBooking.id) {
      try {
        if (cancelBooking) {
          await cancelBooking(currentBooking.id, 'Payment cancelled by user');
          showToast({
            type: 'info',
            message: 'Booking cancelled. Room is now available for other guests.',
          });
        }
      } catch (err) {
        console.error('Error cancelling booking:', err);
        // Still close the modal even if cancel fails
      }
    }
    setShowQRPayment(false);
    setCurrentBooking(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      showToast({ type: 'info', message: 'Sign in to share your review.' });
      return;
    }
    if (!reviewForm.comment.trim()) {
      showToast({ type: 'error', message: 'Please add your thoughts before submitting.' });
      return;
    }

    const newReview = {
      id: createLocalId(),
      userId: user?.id,
      userName: user?.name || user?.email?.split('@')[0],
      userEmail: user?.email,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      createdAt: new Date().toISOString(),
    };

    // Lưu về Supabase TRƯỚC (theo room_id cụ thể, KHÔNG lưu room_type_id để tránh áp dụng cho tất cả)
    if (room?.id) {
      try {
        const savedReview = await createReview({
          room_id: room.id, // CHỈ lưu room_id cụ thể, KHÔNG lưu room_type_id
          user_id: newReview.userId,
          user_name: newReview.userName,
          user_email: newReview.userEmail,
          rating: newReview.rating,
          comment: newReview.comment,
          created_at: newReview.createdAt,
        });
        
        if (savedReview) {
          // Update newReview với id từ DB
          newReview.id = savedReview.id;
        }
        
        // Cập nhật UI sau khi lưu thành công
        setReviews((prev) => [newReview, ...prev]);
        showToast({ type: 'success', message: 'Thank you for sharing your experience!' });
        setReviewForm({ rating: 5, comment: '' });
        
        // Reload reviews từ DB để đảm bảo sync
        const updatedReviews = await fetchRoomReviews(room.id, null);
        if (updatedReviews && updatedReviews.length > 0) {
          const normalized = updatedReviews.map((r) => ({
            id: r.id,
            userId: r.user_id,
            userName: r.user_name,
            userEmail: r.user_email,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
            stayDate: r.stay_date,
          }));
          setReviews(normalized);
        }
      } catch (err) {
        console.error('Error saving review to Supabase:', err);
        showToast({ type: 'error', message: 'Failed to save review. Please try again.' });
      }
    } else {
      // Nếu không có room.id, chỉ update UI local
      setReviews((prev) => [newReview, ...prev]);
      showToast({ type: 'success', message: 'Thank you for sharing your experience!' });
      setReviewForm({ rating: 5, comment: '' });
    }
  };

  return (
    <section>
      <ScrollToTop />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className='bg-room h-[560px] relative flex justify-center items-center bg-cover bg-center'>
        <div className='absolute w-full h-full bg-black/70' />
        <h1 className='text-5xl lg:text-6xl text-white z-20 font-primary text-center'>{room.name} Details</h1>
      </div>

      <div className='container mx-auto'>
        <div className='flex flex-col lg:flex-row lg:gap-x-8 h-full py-24'>
          <div className='w-full lg:w-[60%] h-full text-justify'>
            <h2 className='h2'>{room.name}</h2>
            <p className='mb-8 text-primary/80'>{room.description}</p>
            <img
              className='mb-8'
              src={room.imageLg || room.image || PLACEHOLDER_IMG}
              alt={room.name}
              onError={(e) => {
                console.warn('❌ Large image failed to load from Supabase:', room.imageLg);
                e.target.src = PLACEHOLDER_IMG;
              }}
            />

            <div className='flex items-center gap-4 mb-10'>
              <div className='text-4xl font-primary text-accent'>
                {averageRating ? averageRating : 'N/A'}
              </div>
              <div className='flex text-accent'>
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`text-2xl ${averageRating && index < Math.round(averageRating) ? 'text-accent' : 'text-accent/20'}`}
                  />
                ))}
              </div>
              <p className='text-sm text-primary/70'>
                {reviews.length ? `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}` : 'Be the first to review this stay'}
              </p>
            </div>


            <div className='mt-12'>
              <h3 className='h3 mb-3'>Details</h3>
              <p className='mb-12'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis accusantium sapiente quas quos explicabo, odit nostrum? Reiciendis illum dolor eos dicta. Illum vero at hic nostrum sint et quod porro.
              </p>

              {/* icons grid */}
              <div className="grid grid-cols-3 gap-6 mb-12">
                {room.facilities && room.facilities.length > 0 ? (
                  room.facilities.map((item, index) => (
                    <div key={index} className="flex items-center gap-x-3 flex-1">
                      {getFacilityIcon(item)}
                      <div className="text-base">{typeof item === 'string' ? item : item.name}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-primary/70 col-span-3">No facilities information available</p>
                )}
              </div>
            </div>

            <div className='space-y-6'>
              <h3 className='h3'>Guest impressions</h3>
              <div className='space-y-4'>
                {reviews.length ? (
                  reviews.map(review => (
                    <div key={review.id} className='border border-accent/10 p-5 bg-white shadow-sm'>
                      <div className='flex justify-between items-center mb-2'>
                        <div>
                          <p className='font-semibold'>{review.userName}</p>
                          <span className='text-xs text-primary/60'>
                            {review.stayDate ||
                              (review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString('vi-VN')
                                : 'Anonymous Guest')}
                          </span>
                        </div>
                        <div className='flex text-accent'>
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              className={`${index < review.rating ? 'text-accent' : 'text-accent/20'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className='text-primary/80 leading-relaxed'>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className='text-primary/70'>No reviews for this room yet.</p>
                )}
              </div>

              <div className='mt-8'>
                <h4 className='font-primary text-2xl mb-4'>Share your stay experience</h4>
                {isAuthenticated() ? (
                  <form onSubmit={handleReviewSubmit} className='space-y-4'>
                    <div>
                      <label className='block text-sm font-semibold mb-2'>Rating</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        className='border border-accent/20 px-4 py-3 w-full focus:outline-none focus:border-accent'
                      >
                        {[5, 4, 3, 2, 1].map(score => (
                          <option key={score} value={score}>
                            {score} Star
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-semibold mb-2'>Your thoughts</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                        className='border border-accent/20 px-4 py-3 w-full focus:outline-none focus:border-accent resize-none'
                        placeholder='What delighted you the most during your stay?'
                      />
                    </div>
                    <button type='submit' className='btn btn-secondary'>
                      Submit review
                    </button>
                  </form>
                ) : (
                  <p className='text-sm text-primary/70'>
                    Sign in to unlock review privileges.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='w-full lg:w-[40%] h-full'>
            <div className='py-8 px-6 bg-accent/20 mb-12'>
              <h3 className='h3 mb-6'>Your Reservation</h3>
              <div className='flex justify-between items-center mb-6'>
                <div>
                  <p className='text-sm text-primary/60'>Rate per night</p>
                  <p className='text-3xl font-primary text-accent'>
                    ${pricingPreview?.basePricePerNight?.toFixed(2) || room.price?.toFixed(2) || '0.00'}
                  </p>
                  {pricingPreview?.breakdown && (
                    <p className='text-xs text-primary/50 mt-1'>
                      Base: ${room.price?.toFixed(2)}
                      {pricingPreview.breakdown.weekendAdjustment > 0 && ` • Weekend: +${pricingPreview.breakdown.weekendAdjustment.toFixed(2)}`}
                      {pricingPreview.breakdown.holidayAdjustment > 0 && ` • Holiday: +${pricingPreview.breakdown.holidayAdjustment.toFixed(2)}`}
                    </p>
                  )}
                </div>
                <div className='text-sm text-primary/60 text-right'>
                  <p>Up to {maxGuests} guests</p>
                  <p>{nights} night(s) • ${totalPrice?.toFixed(2) || '0.00'}</p>
                  {reservation.promoCode && (
                    <p className='text-xs text-accent mt-1'>Promo: {reservation.promoCode}</p>
                  )}
                </div>
              </div>

              <form className='space-y-4' onSubmit={handleBooking}>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='text-xs uppercase tracking-[2px] text-primary/60'>Check-in</label>
                    <input
                      type='date'
                      value={reservation.checkIn}
                      onChange={(e) => handleReservationChange('checkIn', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className='w-full bg-white border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent'
                    />
                  </div>
                  <div>
                    <label className='text-xs uppercase tracking-[2px] text-primary/60'>Check-out</label>
                    <input
                      type='date'
                      value={reservation.checkOut}
                      onChange={(e) => handleReservationChange('checkOut', e.target.value)}
                      min={reservation.checkIn ? new Date(new Date(reservation.checkIn).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                      className='w-full bg-white border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='text-xs uppercase tracking-[2px] text-primary/60 mb-2 block'>Adults</label>
                    <select
                      value={reservation.adults}
                      onChange={(e) => {
                        const nextAdults = Number(e.target.value);
                        const spare = Math.max(0, maxGuests - nextAdults);
                        const nextKids = Math.min(reservation.kids, spare);
                        setReservation(prev => ({ ...prev, adults: nextAdults, kids: nextKids }));
                      }}
                      className='w-full border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent bg-white cursor-pointer'
                    >
                      {Array.from({ length: maxGuests }, (_, idx) => idx + 1).map(value => (
                        <option key={value} value={value}>{value} {value === 1 ? 'Adult' : 'Adults'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='text-xs uppercase tracking-[2px] text-primary/60 mb-2 block'>Kids</label>
                    <select
                      value={reservation.kids}
                      onChange={(e) => {
                        const selectedKids = Number(e.target.value);
                        const total = reservation.adults + selectedKids;
                        if (total <= maxGuests) {
                          handleReservationChange('kids', selectedKids);
                        } else {
                          const maxKids = Math.max(0, maxGuests - reservation.adults);
                          handleReservationChange('kids', maxKids);
                          showToast({ 
                            type: 'error', 
                            message: `Maximum ${maxGuests} guests allowed. Kids adjusted to ${maxKids}.` 
                          });
                        }
                      }}
                      className='w-full border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent bg-white cursor-pointer'
                      disabled={reservation.adults >= maxGuests}
                    >
                      {Array.from({ length: Math.max(0, maxGuests - reservation.adults) + 1 }, (_, idx) => idx).map(value => (
                        <option key={value} value={value}>
                          {value === 0 ? 'No Kids' : `${value} ${value === 1 ? 'Kid' : 'Kids'}`}
                        </option>
                      ))}
                    </select>
                    {reservation.adults >= maxGuests && (
                      <p className='text-xs text-primary/50 mt-1'>Maximum guests reached</p>
                    )}
                  </div>
                </div>
                {/* Guest Booking Fields - Only show if not authenticated */}
                {!isAuthenticated() && (
                  <>
                    <div className='border-t border-accent/20 pt-4 mt-4'>
                      <p className='text-sm font-semibold text-primary mb-3'>Guest Information</p>
                    </div>
                    <div>
                      <label className='text-xs uppercase tracking-[2px] text-primary/60'>Full Name *</label>
                      <input
                        type='text'
                        required
                        value={reservation.guestName}
                        onChange={(e) => handleReservationChange('guestName', e.target.value)}
                        className='w-full bg-white border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent'
                        placeholder='Your full name'
                      />
                    </div>
                    <div>
                      <label className='text-xs uppercase tracking-[2px] text-primary/60'>Email *</label>
                      <input
                        type='email'
                        required
                        value={reservation.guestEmail}
                        onChange={(e) => handleReservationChange('guestEmail', e.target.value)}
                        className='w-full bg-white border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent'
                        placeholder='your.email@example.com'
                      />
                    </div>
                    <div>
                      <label className='text-xs uppercase tracking-[2px] text-primary/60'>Phone (Optional)</label>
                      <input
                        type='tel'
                        value={reservation.guestPhone}
                        onChange={(e) => handleReservationChange('guestPhone', e.target.value)}
                        className='w-full bg-white border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent'
                        placeholder='+84 123 456 789'
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className='text-xs uppercase tracking-[2px] text-primary/60'>Promo Code (Optional)</label>
                  <input
                    type='text'
                    value={reservation.promoCode}
                    onChange={(e) => {
                      const code = e.target.value.trim().toUpperCase();
                      handleReservationChange('promoCode', code);
                      
                      // Real-time validation
                      if (!code) {
                        setPromoValidation({ isValid: null, message: '' });
                      } else if (Array.isArray(promotions) && promotions.length > 0) {
                        const promo = promotions.find(p => 
                          p && p.is_active && p.code && p.code.toUpperCase() === code
                        );
                        
                        if (promo) {
                          // Check date range
                          const now = new Date();
                          const startDate = new Date(promo.start_date);
                          startDate.setHours(0, 0, 0, 0);
                          const endDate = new Date(promo.end_date);
                          endDate.setHours(23, 59, 59, 999);
                          const nowDate = new Date(now);
                          nowDate.setHours(0, 0, 0, 0);
                          
                          if (nowDate < startDate) {
                            setPromoValidation({ 
                              isValid: false, 
                              message: `Promotion starts on ${startDate.toLocaleDateString()}` 
                            });
                          } else if (nowDate > endDate) {
                            setPromoValidation({ 
                              isValid: false, 
                              message: `Promotion expired on ${new Date(promo.end_date).toLocaleDateString()}` 
                            });
                          } else {
                            const discountText = promo.discount_kind === 'percent' 
                              ? `${promo.discount_value}% off`
                              : `$${promo.discount_value} off`;
                            setPromoValidation({ 
                              isValid: true, 
                              message: `Valid! ${discountText}` 
                            });
                          }
                        } else {
                          setPromoValidation({ 
                            isValid: false, 
                            message: 'Promotion code not found or inactive' 
                          });
                        }
                      } else {
                        setPromoValidation({ isValid: null, message: '' });
                      }
                    }}
                    className={`w-full bg-white border px-4 py-3 focus:outline-none focus:border-accent ${
                      promoValidation.isValid === true 
                        ? 'border-green-500' 
                        : promoValidation.isValid === false 
                        ? 'border-red-500' 
                        : 'border-accent/20'
                    }`}
                    placeholder='E.g. WELCOME25'
                  />
                  {promoValidation.message && (
                    <p className={`text-xs mt-1 ${
                      promoValidation.isValid === true 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {promoValidation.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='text-xs uppercase tracking-[2px] text-primary/60'>Special requests</label>
                  <textarea
                    rows={3}
                    value={reservation.note}
                    onChange={(e) => handleReservationChange('note', e.target.value)}
                    className='w-full bg-white border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent resize-none'
                    placeholder='E.g. birthday setup, dietary requirements...'
                  />
                </div>

                <button type='submit' className='btn btn-primary w-full uppercase tracking-[4px]'>
                  {isAuthenticated() ? 'Confirm reservation' : 'Continue as guest'}
                </button>
                {!isAuthenticated() && (
                  <p className='text-xs text-primary/60 text-center mt-2'>
                    Or <Link to='/login' className='text-accent underline'>sign in</Link> to save your booking history
                  </p>
                )}
              </form>

              {pricingPreview?.breakdown?.length > 0 && (
                <div className='mt-8 bg-white border border-accent/20 rounded'>
                  <div className='px-4 py-3 border-b border-accent/10'>
                    <p className='text-sm font-semibold text-primary'>Nightly breakdown</p>
                  </div>
                  <ul className='divide-y divide-accent/10'>
                    {pricingPreview.breakdown.map((night) => (
                      <li key={night.date} className='px-4 py-3 flex items-center justify-between text-sm'>
                        <div>
                          <p className='font-semibold'>{night.date}</p>
                          <p className='text-primary/60'>{night.label}</p>
                        </div>
                        <p className='font-primary text-lg text-accent'>${night.rate}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h3 className='h3'>Hotel Rules</h3>
              <p className='mb-6 text-justify'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi dolores iure fugiat eligendi illo est, aperiam quasi distinctio necessitatibus suscipit nemo provident eaque voluptas earum.
              </p>

              <ul className='flex flex-col gap-y-4'>
                {
                  hotelRules.map(({ rules }, idx) =>
                    <li key={idx} className='flex items-center gap-x-4'>
                      <FaCheck className='text-accent' />
                      {rules}
                    </li>
                  )
                }
              </ul>
            </div>

          </div>

        </div>
      </div>

      {showQRPayment && currentBooking && (
        <QRPayment
          bookingData={currentBooking}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={handleCloseQRPayment}
          type="room"
        />
      )}

      {showInvoice && currentBooking && (
        <Invoice
          booking={currentBooking}
          onClose={() => setShowInvoice(false)}
          onDownload={() => {
            showToast({ type: 'success', message: 'PDF downloaded successfully!' });
          }}
        />
      )}
    </section>
  );
};

export default RoomDetails;
