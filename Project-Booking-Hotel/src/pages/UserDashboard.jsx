import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/SimpleAuthContext';
import { useRoomContext } from '../context/RoomContext';
import { useBookingContext } from '../context/BookingContext'; // NEW
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Toast from '../components/Toast';
import { FaSuitcaseRolling, FaCalendarAlt, FaUserCircle, FaCamera, FaEdit, FaTimes } from 'react-icons/fa';
import { LogoDark } from '../assets';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'profile', label: 'Profile & Preferences' },
];

const bookingFilterOptions = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
];

const statusBadgeClasses = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  modified: 'bg-sky-100 text-sky-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const UserDashboard = () => {
  const { user, updateUserProfile } = useAuth();
  const {
    getUserBookings: getRoomBookings, // Đổi tên để tránh xung đột
    cancelBooking,
    modifyBookingDates,
  } = useRoomContext();
  
  const {
    getUserRestaurantBookings,
    getUserSpaBookings,
    confirmRestaurantBooking, // Cần cho việc quản lý booking sau này
    confirmSpaBooking,
    restaurantBookings, // Dữ liệu từ context
    spaBookings,
  } = useBookingContext();

  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState('upcoming');
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ type: null, booking: null });
  const [rescheduleDates, setRescheduleDates] = useState({ checkIn: null, checkOut: null });
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    language: 'en',
    bio: '',
    newsletter: true,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
        language: user.language || 'en',
        bio: user.bio || '',
        newsletter: user.newsletter !== undefined ? user.newsletter : true,
      });
    }
  }, [user]);

  const userBookings = useMemo(() => {
    // Combine all types of bookings (Room, Restaurant, Spa) using
    // the normalized objects provided by RoomContext + BookingContext.
    if (!user?.id) return [];

    const roomBookings = getRoomBookings(user.id);
    const restBookings = getUserRestaurantBookings(user.id);
    const spaBookings = getUserSpaBookings(user.id);

    return [
      ...(roomBookings || []),
      ...(restBookings || []),
      ...(spaBookings || []),
    ];
  }, [user, getRoomBookings, getUserRestaurantBookings, getUserSpaBookings]);

  const categorized = useMemo(() => {
    const data = {
      upcoming: [],
      past: [],
      cancelled: [],
      pending: [],
    };
    const now = new Date();

    userBookings.forEach((booking) => {
      if (booking.status === 'cancelled') {
        data.cancelled.push(booking);
      } else if (booking.type === 'room') {
        // Với phòng: mọi trạng thái (pending_payment, confirmed, ...) đều coi là upcoming
        // nếu ngày checkOut >= hôm nay; nếu đã qua thì đưa vào past.
        const checkOut = new Date(booking.checkOut);
        if (checkOut < now) {
          data.past.push(booking);
        } else {
          data.upcoming.push(booking);
        }
      } else {
        // Với restaurant/spa: dùng checkIn làm mốc
        const checkIn = new Date(booking.checkIn);
        if (checkIn < now) {
          data.past.push(booking);
        } else {
          data.upcoming.push(booking);
        }
      }
    });
    
    // Sort upcoming by earliest checkIn date/time
    data.upcoming.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
    
    return data;
  }, [userBookings]);

  const filteredBookings = categorized[bookingFilter] || [];

  const nextBooking = useMemo(() => {
    return categorized.upcoming
      .slice()
      .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))[0];
  }, [categorized.upcoming]);

  const loyaltyNights = useMemo(() => {
    return userBookings.reduce((total, booking) => {
      if (booking.status === 'cancelled') return total;
      return total + (booking.totalNights || 0);
    }, 0);
  }, [userBookings]);

  const showToast = (payload) => {
    setToast(payload);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCancelBooking = (booking) => {
    cancelBooking(booking.id);
    showToast({ type: 'info', message: `Booking ${booking.confirmationCode} was cancelled.` });
    setModalState({ type: null, booking: null });
  };

  const handleModifyBooking = (booking, newCheckIn, newCheckOut) => {
    if (!newCheckIn || !newCheckOut) {
      showToast({ type: 'error', message: 'Please choose both dates.' });
      return;
    }
    try {
      modifyBookingDates(booking.id, { checkIn: newCheckIn, checkOut: newCheckOut });
      showToast({ type: 'success', message: 'Booking updated successfully!' });
      setModalState({ type: null, booking: null });
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Unable to reschedule booking.' });
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateUserProfile({ avatar: reader.result });
      showToast({ type: 'success', message: 'Profile photo updated.' });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!profileForm.name || profileForm.name.trim().length < 2) {
      showToast({ type: 'error', message: 'Name must be at least 2 characters' });
      return;
    }

    if (!profileForm.email || !profileForm.email.includes('@')) {
      showToast({ type: 'error', message: 'Please enter a valid email' });
      return;
    }
    
    const phoneRegex = /^[\d\s\-\+\(\)]*$/;
    if (profileForm.phone && !phoneRegex.test(profileForm.phone)) {
      showToast({ type: 'error', message: 'Please enter a valid phone number' });
      return;
    }
    
    if (!profileForm.country || profileForm.country.trim() === '') {
      showToast({ type: 'error', message: 'Please select a country' });
      return;
    }
    
    updateUserProfile(profileForm);
    showToast({ type: 'success', message: 'Profile updated successfully!' });
  };

  const bookingIsEditable = (booking) => new Date(booking.checkIn) > new Date() && booking.status !== 'cancelled';

  const perks = [
    { label: 'Late checkout', detail: 'Complimentary 1-hour grace period on availability' },
    { label: 'Spa credit', detail: '$25 spa credit for every 5 nights stayed' },
    { label: 'Concierge chat', detail: 'Direct WhatsApp line for bespoke planning' },
  ];

  const renderOverview = () => (
    <div className='space-y-8'>
      <div className='bg-gradient-to-r from-[#f1d7b1] via-[#f7f4ef] to-[#e7d8c2] rounded-2xl p-6 text-primary shadow-lg border border-white/60 flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
        <div>
          <p className='uppercase tracking-[6px] text-xs text-primary/70'>Welcome back</p>
          <h3 className='font-primary text-3xl mb-2'>Your private Maison awaits, {user.name?.split(' ')[0] || 'guest'}</h3>
          <p className='text-sm text-primary/70 max-w-xl'>
            Track upcoming retreats, earn loyalty nights, and curate personal details for a seamless arrival. Our concierge is on standby 24/7.
          </p>
        </div>
        <div className='bg-white/80 rounded-xl p-4 w-full md:w-auto min-w-[220px]'>
          <p className='uppercase text-xs tracking-[3px] text-primary/60 mb-1'>Loyalty tier</p>
          <p className='font-primary text-2xl'>Golden Orchid</p>
          <p className='text-sm text-primary/70'>Next upgrade in {Math.max(0, 10 - loyaltyNights)} nights</p>
        </div>
      </div>

      <div className='grid sm:grid-cols-3 gap-6'>
        <div className='bg-white/90 p-6 border border-[#eadfcf] rounded shadow-md'>
          <p className='uppercase tracking-[3px] text-xs text-primary/60'>Upcoming stays</p>
          <p className='text-4xl font-primary mt-2'>{categorized.upcoming.length}</p>
        </div>
        <div className='bg-white/90 p-6 border border-[#eadfcf] rounded shadow-md'>
          <p className='uppercase tracking-[3px] text-xs text-primary/60'>Completed stays</p>
          <p className='text-4xl font-primary mt-2'>{categorized.past.length}</p>
        </div>
        <div className='bg-white/90 p-6 border border-[#eadfcf] rounded shadow-md'>
          <p className='uppercase tracking-[3px] text-xs text-primary/60'>Loyalty nights</p>
          <p className='text-4xl font-primary mt-2'>{loyaltyNights}</p>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 bg-white/95 border border-[#eadfcf] rounded-2xl p-6 shadow-md'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='font-primary text-2xl'>Next reservation</h4>
            <Link to='/rooms' className='text-accent hover:underline text-sm'>Book another stay</Link>
          </div>
          {nextBooking ? (
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div>
                <p className='font-semibold text-lg'>{nextBooking.roomName}</p>
                <p className='text-primary/70 text-sm flex items-center gap-2'>
                  <FaCalendarAlt />
                  {nextBooking.checkIn} → {nextBooking.checkOut}
                </p>
              </div>
              <div className='flex items-center gap-3 flex-wrap'>
                <span className={`px-3 py-1 rounded-full text-xs ${statusBadgeClasses[nextBooking.status] || 'bg-gray-100 text-gray-600'}`}>
                  {nextBooking.status}
                </span>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className='btn btn-secondary btn-sm'
                >
                  Manage booking
                </button>
              </div>
            </div>
          ) : (
            <div className='text-primary/70 text-sm'>
              No upcoming stay yet. Start planning your next visit!
            </div>
          )}
        </div>

        <div className='bg-white/95 border border-[#eadfcf] rounded-2xl p-6 shadow-md'>
          <p className='uppercase tracking-[3px] text-xs text-primary/60 mb-4'>Concierge perks</p>
          <ul className='space-y-4 text-sm'>
            {perks.map((perk) => (
              <li key={perk.label} className='border-l-4 border-accent pl-3'>
                <p className='font-semibold text-primary'>{perk.label}</p>
                <p className='text-primary/70'>{perk.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center gap-3'>
        {bookingFilterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setBookingFilter(option.id)}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              bookingFilter === option.id ? 'bg-primary text-white border-primary' : 'border-[#eadfcf] text-primary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className='bg-white border border-[#eadfcf] rounded p-8 text-center text-primary/70'>
          No bookings in this segment yet.
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredBookings.map((booking) => (
            <div key={booking.id} className='bg-white border border-[#eadfcf] rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div>
                {booking.type === 'room' && (
                  <>
                    <p className='font-semibold text-lg'>{booking.roomName || 'Room Booking'}</p>
                    <p className='text-sm text-primary/70 flex items-center gap-2'>
                      <FaCalendarAlt />
                      Check-in: {booking.checkIn} → Check-out: {booking.checkOut}
                    </p>
                    <p className='text-sm text-primary/70'>Guests: {booking.adults} adult(s){booking.kids ? `, ${booking.kids} kid(s)` : ''}</p>
                  </>
                )}
                {booking.type === 'restaurant' && (
                  <>
                    <p className='font-semibold text-lg'>Restaurant Reservation</p>
                    <p className='text-sm text-primary/70 flex items-center gap-2'>
                      <FaCalendarAlt />
                      Time: {new Date(booking.checkIn).toLocaleString('vi-VN')}
                    </p>
                    <p className='text-sm text-primary/70'>Guests: {booking.guests} people. Table for {booking.name}</p>
                  </>
                )}
                {booking.type === 'spa' && (
                  <>
                    <p className='font-semibold text-lg'>Spa Appointment: {booking.serviceName}</p>
                    <p className='text-sm text-primary/70 flex items-center gap-2'>
                      <FaCalendarAlt />
                      Time: {new Date(booking.checkIn).toLocaleString('vi-VN')}
                    </p>
                    <p className='text-sm text-primary/70'>Therapist: {booking.therapist || 'Any'} ({booking.serviceDuration})</p>
                  </>
                )}
                <span className='inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-accent/20 text-accent'>{booking.type}</span>
              </div>
              <div className='flex items-center gap-3 flex-wrap'>
                <span className={`px-3 py-1 rounded-full text-xs ${statusBadgeClasses[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                  {booking.status}
                </span>
                <p className='font-semibold text-accent'>${booking.totalPrice || booking.total_price}</p>
                {booking.type === 'room' && bookingIsEditable(booking) && (
                  <>
                    <button
                      onClick={() => {
                        setRescheduleDates({
                          checkIn: booking.checkIn ? new Date(booking.checkIn) : new Date(),
                          checkOut: booking.checkOut ? new Date(booking.checkOut) : new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
                        });
                        setModalState({ type: 'modify', booking });
                      }}
                      className='btn btn-secondary btn-sm flex items-center gap-2'
                    >
                      <FaEdit /> Modify
                    </button>
                    <button
                      onClick={() => setModalState({ type: 'cancel', booking })}
                      className='btn btn-primary btn-sm flex items-center gap-2 bg-red-500 hover:bg-red-600 border-red-500'
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <form className='space-y-6' onSubmit={handleProfileSubmit}>
      <div className='grid md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-semibold mb-2'>Full name</label>
          <input
            type='text'
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
          />
        </div>
        <div>
          <label className='block text-sm font-semibold mb-2'>Email</label>
          <input
            type='email'
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
          />
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-semibold mb-2'>Phone</label>
          <input
            type='tel'
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
          />
        </div>
        <div>
          <label className='block text-sm font-semibold mb-2'>Country</label>
          <input
            type='text'
            value={profileForm.country}
            onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
            className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
          />
        </div>
        <div>
          <label className='block text-sm font-semibold mb-2'>City</label>
          <input
            type='text'
            value={profileForm.city}
            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
            className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-semibold mb-2'>Preferred language</label>
        <select
          value={profileForm.language}
          onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
          className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent bg-white'
        >
          <option value='en'>English</option>
          <option value='vi'>Vietnamese</option>
          <option value='fr'>French</option>
        </select>
      </div>

      <div>
        <label className='block text-sm font-semibold mb-2'>Short bio</label>
        <textarea
          rows={4}
          value={profileForm.bio}
          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
          className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent resize-none'
          placeholder='Tell us about your travel preferences...'
        />
      </div>

      <div className='flex items-center gap-3'>
        <input
          id='newsletter'
          type='checkbox'
          checked={profileForm.newsletter}
          onChange={(e) => setProfileForm({ ...profileForm, newsletter: e.target.checked })}
          className='w-4 h-4 accent-accent'
        />
        <label htmlFor='newsletter' className='text-sm text-primary/70'>
          Receive curated offers and member-only experiences.
        </label>
      </div>

      <button type='submit' className='btn btn-primary'>
        Save profile
      </button>
    </form>
  );

  const renderModal = () => {
    if (!modalState.type || !modalState.booking) return null;

    if (modalState.type === 'cancel') {
      return (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4'>
            <h3 className='font-primary text-2xl'>Cancel booking?</h3>
            <p className='text-primary/70 text-sm'>
              You are about to cancel reservation {modalState.booking.confirmationCode}. This action cannot be undone.
            </p>
            <div className='flex gap-4'>
              <button className='btn btn-secondary flex-1' onClick={() => setModalState({ type: null, booking: null })}>
                Keep booking
              </button>
              <button
                className='btn btn-primary flex-1 bg-red-500 border-red-500 hover:bg-red-600'
                onClick={() => handleCancelBooking(modalState.booking)}
              >
                Cancel stay
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalState.type === 'modify') {
      return (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4'>
            <h3 className='font-primary text-2xl'>Reschedule booking</h3>
            <p className='text-primary/70 text-sm'>
              Update stay for {modalState.booking.roomName}
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[2px] text-primary/60 mb-1'>New check-in</p>
                <DatePicker
                  selected={rescheduleDates.checkIn}
                  onChange={(date) => setRescheduleDates(prev => ({ ...prev, checkIn: date }))}
                  minDate={new Date()}
                  className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
                />
              </div>
              <div>
                <p className='text-xs uppercase tracking-[2px] text-primary/60 mb-1'>New check-out</p>
                <DatePicker
                  selected={rescheduleDates.checkOut}
                  onChange={(date) => setRescheduleDates(prev => ({ ...prev, checkOut: date }))}
                  minDate={rescheduleDates.checkIn ? new Date(rescheduleDates.checkIn.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                  className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
                />
              </div>
            </div>
            <div className='flex gap-4'>
              <button className='btn btn-secondary flex-1' onClick={() => setModalState({ type: null, booking: null })}>
                Go back
              </button>
              <button
                className='btn btn-primary flex-1'
                onClick={() => handleModifyBooking(modalState.booking, rescheduleDates.checkIn, rescheduleDates.checkOut)}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-primary/70'>Please sign in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen py-12 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.94),_rgba(247,244,239,0.98))]'>
      <div className='container mx-auto px-6 lg:px-0'>
        <LogoDark className='w-40 mx-auto mb-10 opacity-80' />
        <div className='grid lg:grid-cols-4 gap-8'>
          <aside className='bg-white/95 backdrop-blur-sm border border-[#eadfcf] rounded-2xl p-6 shadow-xl'>
            <div className='text-center mb-8'>
              <div className='relative inline-block'>
                <div className='w-28 h-28 rounded-full border-4 border-accent/20 overflow-hidden bg-primary/5 flex items-center justify-center'>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                  ) : (
                    <FaUserCircle className='text-8xl text-primary/30' />
                  )}
                </div>
                <label className='absolute bottom-0 right-0 bg-accent text-white p-2 rounded-full cursor-pointer shadow-lg'>
                  <FaCamera />
                  <input type='file' accept='image/*' className='hidden' onChange={handleAvatarChange} />
                </label>
              </div>
              <h2 className='font-primary text-2xl mt-4'>{user.name}</h2>
              <p className='text-primary/70 text-sm'>{user.email}</p>
            </div>

            <nav className='space-y-2'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'bg-[#f7f4ef] text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className='mt-8 space-y-4'>
              <Link to='/rooms' className='btn btn-secondary w-full flex items-center justify-center gap-2'>
                <FaSuitcaseRolling /> Book a room
              </Link>
              <Link to='/' className='text-sm text-primary/70 hover:text-primary text-center block'>
                Back to homepage
              </Link>
            </div>
          </aside>

          <main className='lg:col-span-3 bg-white/95 backdrop-blur-sm border border-[#eadfcf] rounded-2xl p-6 shadow-xl'>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'bookings' && renderBookings()}
            {activeTab === 'profile' && renderProfile()}
          </main>
        </div>
      </div>

      {renderModal()}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UserDashboard;

