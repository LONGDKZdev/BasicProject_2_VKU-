import { ScrollToTop, Toast } from '../components';
import QRPayment from '../components/QRPayment';
import Invoice from '../components/Invoice';
import { useRoomContext } from '../context/RoomContext';
import { useAuth } from '../context/AuthContext';
import { hotelRules } from '../constants/data';
import { useParams } from 'react-router-dom';
import { FaCheck, FaStar } from 'react-icons/fa';
import { useMemo, useState } from 'react';

// Placeholder image - will be replaced by Supabase Storage URL
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23ddd' width='800' height='600'/%3E%3Ctext x='50%' y='50%' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ELoading image...%3C/text%3E%3C/svg%3E";

const createLocalId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString();
};

const RoomDetails = () => {
  const { id } = useParams();
  const {
    allRooms,
    bookRoom,
    confirmBookingPayment,
    hasUserBookedRoom,
    addReview,
    calculatePricingForRoom,
  } = useRoomContext();
  const { user, isAuthenticated } = useAuth();

  // Support both numeric IDs (legacy) and UUID strings (new)
  const room = allRooms.find(roomItem => 
    roomItem.id === id || roomItem.id === Number(id)
  );

  const [reservation, setReservation] = useState({
    checkIn: '',
    checkOut: '',
    adults: 2,
    kids: 0,
    note: '',
    promoCode: '', // New field for promotion code
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [toast, setToast] = useState(null);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

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
    if (!room?.reviews?.length) return null;
    const score = room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length;
    return score.toFixed(1);
  }, [room]);

  if (!room) {
    return (
      <section className='min-h-screen flex items-center justify-center'>
        <p className='text-xl text-primary/70'>Không tìm thấy phòng phù hợp.</p>
      </section>
    );
  }

  const totalGuests = reservation.adults + reservation.kids;
  const pricingPreview = useMemo(() => {
    if (!room || !reservation.checkIn || !reservation.checkOut) return null;
    return calculatePricingForRoom(room, reservation.checkIn, reservation.checkOut);
  }, [room, reservation.checkIn, reservation.checkOut, calculatePricingForRoom]);
  const totalPrice = pricingPreview?.total ?? nights * room.price;
  const canReview = isAuthenticated() && hasUserBookedRoom(user?.id, room.id);

  const showToast = (payload) => {
    setToast(payload);
    setTimeout(() => setToast(null), 4000);
  };

  const handleReservationChange = (field, value) => {
    setReservation(prev => ({ ...prev, [field]: value }));
  };

  const validateBooking = () => {
    if (!isAuthenticated()) {
      showToast({ type: 'info', message: 'Please sign in to book this room.' });
      return false;
    }
    if (!reservation.checkIn || !reservation.checkOut) {
      showToast({ type: 'error', message: 'Select both check-in and check-out dates.' });
      return false;
    }
    if (new Date(reservation.checkOut) <= new Date(reservation.checkIn)) {
      showToast({ type: 'error', message: 'Check-out must be after check-in.' });
      return false;
    }
    if (totalGuests > maxGuests) {
      showToast({ type: 'error', message: `This category hosts up to ${maxGuests} guests.` });
      return false;
    }
    return true;
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!validateBooking()) return;

    const result = bookRoom({
      roomId: room.id,
      roomName: room.name,
      userId: user?.id,
      userName: user?.name || user?.email?.split('@')[0],
      userEmail: user?.email,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      adults: reservation.adults,
      kids: reservation.kids,
      note: reservation.note,
      promoCode: reservation.promoCode, // Truyền promo code
    });

    if (result?.success) {
      setCurrentBooking(result.booking);
      setShowQRPayment(true);
    } else {
      showToast({
        type: 'error',
        message: result?.error || 'Unable to complete booking. Please try another selection.',
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

  const handleCloseQRPayment = () => {
    setShowQRPayment(false);
    setCurrentBooking(null);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      showToast({ type: 'info', message: 'Sign in to share your review.' });
      return;
    }
    if (!canReview) {
      showToast({ type: 'error', message: 'Only confirmed guests can rate this room.' });
      return;
    }
    if (!reviewForm.comment.trim()) {
      showToast({ type: 'error', message: 'Please add your thoughts before submitting.' });
      return;
    }

    addReview(room.id, {
      id: createLocalId(),
      userId: user?.id,
      userName: user?.name || user?.email?.split('@')[0],
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      createdAt: new Date().toISOString(),
    });

    showToast({ type: 'success', message: 'Thank you for sharing your experience!' });
    setReviewForm({ rating: 5, comment: '' });
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
                {room.reviews?.length ? `${room.reviews.length} reviews` : 'Be the first to review this stay'}
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
                    <div key={index} className='flex items-center gap-x-3 flex-1'>
                      <div className='text-3xl text-accent'>✓</div>
                      <div className='text-base'>{typeof item === 'string' ? item : item.name}</div>
                    </div>
                  ))
                ) : (
                  <p className='text-primary/70 col-span-3'>No facilities information available</p>
                )}
              </div>
            </div>

            <div className='space-y-6'>
              <h3 className='h3'>Guest impressions</h3>
              <div className='space-y-4'>
                {room.reviews?.length ? (
                  room.reviews.map(review => (
                    <div key={review.id} className='border border-accent/10 p-5 bg-white shadow-sm'>
                      <div className='flex justify-between items-center mb-2'>
                        <div>
                          <p className='font-semibold'>{review.userName}</p>
                          <span className='text-xs text-primary/60'>
                            {review.stayDate ||
                              (review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString('vi-VN')
                                : 'Khách ẩn danh')}
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
                {canReview ? (
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
                            {score} sao
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
                    Sign in and complete a stay in this room to unlock review privileges.
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
                  <p className='text-3xl font-primary text-accent'>${room.price}</p>
                </div>
                <div className='text-sm text-primary/60 text-right'>
                  <p>Up to {maxGuests} guests</p>
                  <p>{nights} night(s) • ${totalPrice}</p>
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
                      className='w-full bg-white border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent'
                    />
                  </div>
                  <div>
                    <label className='text-xs uppercase tracking-[2px] text-primary/60'>Check-out</label>
                    <input
                      type='date'
                      value={reservation.checkOut}
                      onChange={(e) => handleReservationChange('checkOut', e.target.value)}
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
                <div>
                  <label className='text-xs uppercase tracking-[2px] text-primary/60'>Promo Code (Optional)</label>
                  <input
                    type='text'
                    value={reservation.promoCode}
                    onChange={(e) => handleReservationChange('promoCode', e.target.value)}
                    className='w-full bg-white border border-accent/20 px-4 py-3 focus:outline-none focus:border-accent'
                    placeholder='E.g. WELCOME25'
                  />
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
                  Confirm reservation
                </button>
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
