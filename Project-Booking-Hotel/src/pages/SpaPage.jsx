import { useState, useEffect } from 'react';
import { ScrollToTop, Toast } from '../components';
import QRPayment from '../components/QRPayment';
import Invoice from '../components/Invoice';
import ServiceSelector from '../components/ServiceSelector';
import AvailabilityViewer from '../components/AvailabilityViewer';
import { useBookingContext } from '../context/BookingContext';
import { useAuth } from '../context/SimpleAuthContext';
import {
  fetchSpaServices,
  fetchSpaSlotsByDateTime,
  updateSpaSlotUsage,
} from '../services/bookingService';
// ⚠️ Local images removed - now use Supabase URLs
import { FaSpa, FaClock, FaMapMarkerAlt, FaPhoneAlt, FaStar, FaCheck, FaLeaf, FaWater, FaHandSparkles } from 'react-icons/fa';

const STORAGE_URL = "https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms";
const PLACEHOLDER_IMG_SERVICE = "https://via.placeholder.com/400x300?text=Service+Image";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23ddd' width='300' height='200'/%3E%3Ctext x='50%' y='50%' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ESpa Service%3C/text%3E%3C/svg%3E";

const spaCategories = [
  { id: 'massage', name: 'Massage Therapies', icon: FaHandSparkles },
  { id: 'facial', name: 'Facial Treatments', icon: FaSpa },
  { id: 'body', name: 'Body Treatments', icon: FaLeaf },
  { id: 'wellness', name: 'Wellness Packages', icon: FaWater },
];

// Helper function to get image for spa services
// Uses Supabase Storage URLs based on room types when available
const getSpaServiceImage = (id, imageUrl = null, displayOrder = null) => {
  // If image_url from DB is valid and NOT a placeholder, use it
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('via.placeholder.com')) {
    return imageUrl;
  }
  
  // Fallback: Use display_order or hash id to cycle through images 1-8.png
  // Images are named 1-lg.png through 8-lg.png for large format
  if (!id) return PLACEHOLDER_IMG_SERVICE;
  
  // If display_order is available, use it directly
  let imgIndex = 1;
  if (displayOrder && typeof displayOrder === 'number') {
    imgIndex = ((displayOrder - 1) % 8) + 1;
  } else {
    // Hash UUID/string id to get consistent number 1-8
    let hash = 0;
    const idStr = String(id);
    for (let i = 0; i < idStr.length; i++) {
      hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    imgIndex = (Math.abs(hash) % 8) + 1;
  }
  
  const finalUrl = `${STORAGE_URL}/${imgIndex}-lg.png`;
  // Test if image exists (async, non-blocking)
  if (typeof window !== 'undefined') {
    const img = new Image();
    img.onerror = () => console.warn(`[Spa] Image not found: ${finalUrl}`);
    img.onload = () => console.log(`[Spa] Image loaded: ${finalUrl}`);
    img.src = finalUrl;
  }
  return finalUrl;
};

const spaServices = {
  massage: [
    { id: 1, name: 'Swedish Massage', description: 'Classic relaxation massage with long, flowing strokes', duration: '60 min', price: 95, popular: true, image: getSpaServiceImage(1) },
    { id: 2, name: 'Deep Tissue Massage', description: 'Therapeutic massage targeting muscle tension and knots', duration: '90 min', price: 135, image: getSpaServiceImage(2) },
    { id: 3, name: 'Hot Stone Massage', description: 'Heated stones for deep muscle relaxation and stress relief', duration: '90 min', price: 145, popular: true, image: getSpaServiceImage(3) },
    { id: 4, name: 'Aromatherapy Massage', description: 'Essential oils combined with therapeutic massage techniques', duration: '60 min', price: 105, image: getSpaServiceImage(4) },
    { id: 5, name: 'Thai Massage', description: 'Traditional Thai stretching and acupressure techniques', duration: '90 min', price: 125, image: getSpaServiceImage(5) },
    { id: 6, name: 'Couples Massage', description: 'Side-by-side massage experience in a private suite', duration: '90 min', price: 280, image: getSpaServiceImage(6) },
  ],
  facial: [
    { id: 7, name: 'Signature Facial', description: 'Deep cleansing, exfoliation, and hydration treatment', duration: '60 min', price: 120, popular: true, image: getSpaServiceImage(7) },
    { id: 8, name: 'Anti-Aging Facial', description: 'Advanced treatment to reduce fine lines and improve elasticity', duration: '75 min', price: 165, image: getSpaServiceImage(8) },
    { id: 9, name: 'Hydrating Facial', description: 'Intensive moisture treatment for dry and dehydrated skin', duration: '60 min', price: 115, image: getSpaServiceImage(9) },
    { id: 10, name: 'Brightening Facial', description: 'Vitamin C treatment to even skin tone and reduce pigmentation', duration: '60 min', price: 130, image: getSpaServiceImage(10) },
    { id: 11, name: 'Acne Treatment', description: 'Specialized treatment for acne-prone and sensitive skin', duration: '75 min', price: 140, image: getSpaServiceImage(11) },
  ],
  body: [
    { id: 12, name: 'Body Scrub', description: 'Exfoliating treatment with natural sea salt and essential oils', duration: '60 min', price: 110, popular: true, image: getSpaServiceImage(12) },
    { id: 13, name: 'Body Wrap', description: 'Detoxifying wrap with mineral-rich mud and algae', duration: '90 min', price: 150, image: getSpaServiceImage(13) },
    { id: 14, name: 'Cellulite Treatment', description: 'Targeted treatment to reduce appearance of cellulite', duration: '75 min', price: 140, image: getSpaServiceImage(14) },
    { id: 15, name: 'Full Body Polish', description: 'Complete body exfoliation and hydration treatment', duration: '90 min', price: 160, image: getSpaServiceImage(15) },
  ],
  wellness: [
    { id: 16, name: 'Spa Day Package', description: 'Full day experience: massage, facial, body treatment, and lunch', duration: '5 hours', price: 450, popular: true, image: getSpaServiceImage(16), includes: ['Swedish Massage', 'Signature Facial', 'Body Scrub', 'Gourmet Lunch'] },
    { id: 17, name: 'Couples Retreat', description: 'Romantic package for two with couples massage and champagne', duration: '3 hours', price: 520, image: getSpaServiceImage(17), includes: ['Couples Massage', 'Side-by-side Facial', 'Champagne Service'] },
    { id: 18, name: 'Detox & Renewal', description: 'Complete detox package with body wrap, massage, and herbal tea', duration: '4 hours', price: 380, image: getSpaServiceImage(18), includes: ['Body Wrap', 'Aromatherapy Massage', 'Herbal Tea Service'] },
    { id: 19, name: 'Ultimate Relaxation', description: 'Premium package with all signature treatments and private suite', duration: '6 hours', price: 650, image: getSpaServiceImage(19), includes: ['Hot Stone Massage', 'Anti-Aging Facial', 'Full Body Polish', 'Private Suite Access'] },
  ],
};

const facilities = [
  { name: 'Steam Room', description: 'Relaxing steam therapy for detoxification' },
  { name: 'Sauna', description: 'Traditional Finnish sauna experience' },
  { name: 'Jacuzzi', description: 'Hydrotherapy pool with heated water' },
  { name: 'Relaxation Lounge', description: 'Peaceful space with herbal teas and light refreshments' },
  { name: 'Private Treatment Rooms', description: 'Elegant suites for personalized treatments' },
  { name: 'Fitness Center', description: 'State-of-the-art equipment with personal training available' },
];

const openingHours = [
  { day: 'Monday - Friday', time: '09:00 - 21:00' },
  { day: 'Saturday - Sunday', time: '08:00 - 22:00' },
  { day: 'Holidays', time: '10:00 - 20:00' },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    rating: 5,
    comment: 'The most relaxing experience I\'ve ever had. The hot stone massage was incredible!',
  },
  {
    name: 'Michael Chen',
    rating: 5,
    comment: 'The couples retreat package was perfect for our anniversary. Highly recommended!',
  },
  {
    name: 'Emma Williams',
    rating: 5,
    comment: 'The facial treatment left my skin glowing. The staff is professional and attentive.',
  },
];

const SpaPage = () => {
  const { user } = useAuth();
  const { createSpaBooking, confirmSpaBooking } = useBookingContext();
  const [servicesByCategory, setServicesByCategory] = useState(spaServices);
  const [serviceLookup, setServiceLookup] = useState({});
  const [activeCategory, setActiveCategory] = useState('massage');
  const [toast, setToast] = useState(null);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: '',
    therapist: '',
    specialRequests: '',
  });

  // Auto-fill form when user is logged in
  useEffect(() => {
    if (user) {
      setBookingForm((prev) => ({
        ...prev,
        name: user.full_name || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Load spa services from Supabase (fallback to static if error)
  useEffect(() => {
    const loadSpaServices = async () => {
      try {
        const data = await fetchSpaServices();
        if (!data || data.length === 0) {
          console.warn('[Spa] No services from Supabase, using static data');
          return;
        }
        console.log(`[Spa] Loaded ${data.length} services from Supabase`);

        const grouped = data.reduce((acc, item) => {
          const cat = (item.category || 'other').toLowerCase();
          acc[cat] = acc[cat] || [];
          acc[cat].push({
            id: item.id,
            code: item.code,
            name: item.name,
            description: item.description,
            duration: `${item.duration_minutes} min`,
            price: Number(item.price) || 0,
            popular: item.is_active,
            image: getSpaServiceImage(item.id, item.image_url, item.display_order),
            includes: item.includes || item.perks || null,
          });
          return acc;
        }, {});

        const lookup = {};
        Object.values(grouped).forEach((list) => {
          list.forEach((svc) => {
            lookup[svc.name] = svc;
          });
        });

        setServicesByCategory(grouped);
        setServiceLookup(lookup);
        setActiveCategory(Object.keys(grouped)[0] || 'massage');
      } catch (err) {
        console.warn('Fallback to static spa services, fetch error:', err);
      }
    };
    loadSpaServices();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.email || !bookingForm.date || !bookingForm.time || !bookingForm.service) {
      setToast({
        type: 'error',
        message: 'Please fill in all required fields.',
      });
      return;
    }

    // Require service and slot selection
    if (!selectedService) {
      setToast({
        type: 'error',
        message: 'Please select a service from the list above.',
      });
      return;
    }

    if (!selectedSlot) {
      setToast({
        type: 'error',
        message: 'Please select an available slot from the list above.',
      });
      return;
    }

    const price = selectedService.price || 100;
    const duration = selectedService.duration || '60 min';
    // Ensure proper ISO format: YYYY-MM-DDTHH:MM:SS
    const appointmentAt = bookingForm.date && bookingForm.time 
      ? `${bookingForm.date}T${bookingForm.time}:00` 
      : `${bookingForm.date}T${bookingForm.time}`;

    // Verify selected slot is still available
    const slots = await fetchSpaSlotsByDateTime(selectedService.id, appointmentAt, bookingForm.therapist || null);
    const availableSlot = slots.find((s) => s.id === selectedSlot.slotId && s.status === 'available');
    
    if (!availableSlot) {
      setToast({
        type: 'error',
        message: 'Selected slot is no longer available. Please select another slot.',
      });
      setSelectedSlot(null);
      return;
    }

    // Update slot usage
    await updateSpaSlotUsage(availableSlot.id);

    const result = createSpaBooking({
      name: bookingForm.name,
      email: bookingForm.email,
      phone: bookingForm.phone,
      date: appointmentAt, // Use the properly formatted appointmentAt
      service: bookingForm.service,
      serviceName: bookingForm.service,
      therapist: bookingForm.therapist,
      specialRequests: bookingForm.specialRequests,
      userId: user?.id,
      userName: bookingForm.name,
      userEmail: bookingForm.email,
      price,
      totalPrice: price,
      duration,
    });

    if (result?.success) {
      setCurrentBooking(result.booking);
      setShowQRPayment(true);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    if (!currentBooking) return;
    
    const confirmedBooking = confirmSpaBooking(currentBooking.id, paymentData);
    setCurrentBooking(confirmedBooking);
    setShowQRPayment(false);
    setShowInvoice(true);
    setToast({
      type: 'success',
      message: 'Payment successful! Your appointment is confirmed.',
    });
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      service: '',
      therapist: '',
      specialRequests: '',
    });
  };

  const handleCloseQRPayment = () => {
    setShowQRPayment(false);
    setCurrentBooking(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (serviceName) => {
    setBookingForm((prev) => ({ ...prev, service: serviceName }));
  };

  return (
    <div className='min-h-screen bg-[#f7f4ef]'>
      <ScrollToTop />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Section */}
      <section className='relative h-[60vh] min-h-[480px] flex items-center justify-center text-center'>
        <img
          src={`${STORAGE_URL}/3-lg.png`}
          alt='Spa relaxation'
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-black/60' />
        <div className='relative z-10 max-w-3xl px-6 text-white'>
          <p className='font-tertiary uppercase tracking-[6px] text-sm mb-4'>
            Adina Hotel &amp; Spa
          </p>
          <h1 className='font-primary text-4xl md:text-5xl lg:text-6xl leading-tight mb-6'>
            Sanctuary of Wellness
          </h1>
          <p className='text-lg text-white/80'>
            Rejuvenate your mind, body, and soul with our world-class spa treatments and holistic wellness experiences.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className='container mx-auto px-6 lg:px-0 py-20'>
        <div className='text-center mb-12'>
          <p className='font-tertiary uppercase tracking-[4px] text-xs text-primary/70 mb-2'>
            Our Services
          </p>
          <h2 className='font-primary text-4xl mb-4'>Spa Treatments</h2>
          <p className='text-primary/70 max-w-2xl mx-auto'>
            Indulge in our curated selection of therapeutic treatments designed to restore balance and promote well-being.
          </p>
        </div>

        {/* Category Tabs */}
        <div className='flex flex-wrap justify-center gap-4 mb-12'>
          {spaCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 border rounded-full transition ${
                  activeCategory === category.id
                    ? 'bg-accent text-white border-accent'
                    : 'border-[#eadfcf] text-primary hover:border-accent'
                }`}
              >
                <Icon />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {(servicesByCategory[activeCategory] || []).map((service) => (
            <div
              key={service.id}
              className='bg-white shadow-sm border border-[#eadfcf] hover:shadow-lg transition-shadow cursor-pointer overflow-hidden'
              onClick={() => handleServiceSelect(service.name)}
            >
              <div className='relative h-48 overflow-hidden'>
                <img
                  src={service.image}
                  alt={service.name}
                  className='w-full h-full object-cover hover:scale-110 transition-transform duration-300'
                  onError={(e) => {
                    console.error(`[Spa] Failed to load image: ${service.image}`);
                    e.target.src = PLACEHOLDER_IMG_SERVICE;
                  }}
                />
                {service.popular && (
                  <span className='absolute top-3 right-3 flex items-center gap-1 bg-accent text-white px-3 py-1 rounded-full text-xs'>
                    <FaStar />
                    <span>Popular</span>
                  </span>
                )}
              </div>
              <div className='p-6'>
                <h3 className='font-primary text-xl mb-2'>{service.name}</h3>
                <p className='text-sm text-primary/70 mb-3'>{service.description}</p>
                {service.includes && (
                  <div className='mb-3'>
                    <p className='text-xs font-semibold text-primary/60 mb-1'>Includes:</p>
                    <ul className='text-xs text-primary/70 space-y-1'>
                      {service.includes.map((item, idx) => (
                        <li key={idx} className='flex items-center gap-1'>
                          <FaCheck className='text-accent text-[10px]' />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-primary/60'>{service.duration}</span>
                  <p className='font-primary text-2xl text-accent'>${service.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities Section */}
      <section className='bg-white py-20'>
        <div className='container mx-auto px-6 lg:px-0'>
          <div className='text-center mb-12'>
            <p className='font-tertiary uppercase tracking-[4px] text-xs text-primary/70 mb-2'>
              Our Facilities
            </p>
            <h2 className='font-primary text-4xl mb-4'>Wellness Amenities</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {facilities.map((facility, index) => {
              // Use Supabase images or placeholder (1-6)
              const imgIndex = (index % 6) + 1;
              let facilityImage = `${STORAGE_URL}/${imgIndex}-lg.png`;
              
              return (
                <div
                  key={index}
                  className='bg-[#f7f4ef] border border-[#eadfcf] hover:shadow-lg transition-shadow overflow-hidden'
                >
                  <div className='relative h-40 overflow-hidden'>
                    <img
                      src={facilityImage}
                      alt={facility.name}
                      className='w-full h-full object-cover hover:scale-110 transition-transform duration-300'
                    />
                  </div>
                  <div className='p-6'>
                    <h3 className='font-primary text-xl mb-2'>{facility.name}</h3>
                    <p className='text-sm text-primary/70'>{facility.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className='container mx-auto px-6 lg:px-0 py-20'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Booking Form */}
          <div className='bg-white p-8 shadow-sm border border-[#eadfcf]'>
            <p className='font-tertiary uppercase tracking-[4px] text-xs text-primary/70 mb-2'>
              Book Your Treatment
            </p>
            <h2 className='font-primary text-3xl mb-6'>Schedule an Appointment</h2>
            <form onSubmit={handleBookingSubmit} className='space-y-5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-sm font-semibold mb-2'>Full Name *</label>
                  <input
                    type='text'
                    name='name'
                    value={bookingForm.name}
                    onChange={handleInputChange}
                    className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
                    placeholder='John Carter'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold mb-2'>Email *</label>
                  <input
                    type='email'
                    name='email'
                    value={bookingForm.email}
                    onChange={handleInputChange}
                    className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
                    placeholder='john@example.com'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-sm font-semibold mb-2'>Phone *</label>
                  <input
                    type='tel'
                    name='phone'
                    value={bookingForm.phone}
                    onChange={handleInputChange}
                    className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
                    placeholder='+84 987 654 321'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold mb-2'>Preferred Therapist</label>
                  <select
                    name='therapist'
                    value={bookingForm.therapist}
                    onChange={handleInputChange}
                    className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent bg-white'
                  >
                    <option value=''>No preference</option>
                    <option value='Sarah'>Sarah - Massage Specialist</option>
                    <option value='Emma'>Emma - Facial Expert</option>
                    <option value='Michael'>Michael - Body Treatment Specialist</option>
                  </select>
                </div>
              </div>

              {/* Service Selection - Integrated in Form */}
              <div>
                <label className='block text-sm font-semibold mb-2'>Select Service *</label>
                <ServiceSelector
                  type="spa"
                  items={Object.values(servicesByCategory).flat()}
                  selected={selectedService?.id}
                  onSelect={(service) => {
                    setSelectedService(service);
                    setBookingForm(prev => ({
                      ...prev,
                      service: service.name
                    }));
                    setSelectedSlot(null); // Reset slot when service changes
                  }}
                  className="mb-4"
                  maxHeight="200px"
                />
                {!selectedService && (
                  <p className="text-xs text-red-500 mt-1">Please select a service to continue</p>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-sm font-semibold mb-2'>Date *</label>
                  <input
                    type='date'
                    name='date'
                    value={bookingForm.date}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSelectedSlot(null); // Reset slot when date changes
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold mb-2'>Time *</label>
                  <input
                    type='time'
                    name='time'
                    value={bookingForm.time}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSelectedSlot(null); // Reset slot when time changes
                    }}
                    className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent'
                    required
                  />
                </div>
              </div>

              {/* Availability Viewer - Show available slots */}
              {selectedService && bookingForm.date && bookingForm.time && (
                <div>
                  <label className='block text-sm font-semibold mb-2'>Available Slots *</label>
                  <AvailabilityViewer
                    type="spa"
                    dateTime={`${bookingForm.date}T${bookingForm.time}`}
                    serviceId={selectedService.id}
                    therapist={bookingForm.therapist || null}
                    onSelect={(slot) => {
                      setSelectedSlot(slot);
                      if (slot.therapist) {
                        setBookingForm(prev => ({
                          ...prev,
                          therapist: slot.therapist
                        }));
                      }
                      console.log('[Spa] Selected slot:', slot);
                    }}
                    className="mb-4"
                  />
                  {!selectedSlot && (
                    <p className="text-xs text-red-500 mt-1">Please select a slot to continue</p>
                  )}
                </div>
              )}

              <div>
                <label className='block text-sm font-semibold mb-2'>Special Requests</label>
                <textarea
                  name='specialRequests'
                  value={bookingForm.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className='w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent resize-none'
                  placeholder='Allergies, pressure preference, etc.'
                />
              </div>

              <button type='submit' className='btn btn-primary w-full uppercase tracking-[4px]'>
                Book Appointment
              </button>
            </form>
          </div>

          {/* Spa Info */}
          <div className='space-y-8'>
            <div className='bg-white p-8 shadow-sm border border-[#eadfcf]'>
              <h3 className='font-primary text-2xl mb-6'>Opening Hours</h3>
              <div className='space-y-4'>
                {openingHours.map((schedule, index) => (
                  <div key={index} className='flex items-center justify-between pb-4 border-b border-[#eadfcf] last:border-0'>
                    <div className='flex items-center gap-3'>
                      <FaClock className='text-accent' />
                      <span className='font-semibold'>{schedule.day}</span>
                    </div>
                    <span className='text-primary/70'>{schedule.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white p-8 shadow-sm border border-[#eadfcf]'>
              <h3 className='font-primary text-2xl mb-6'>Contact Information</h3>
              <div className='space-y-4'>
                <div className='flex items-start gap-4'>
                  <FaMapMarkerAlt className='text-accent mt-1' />
                  <div>
                    <p className='font-semibold'>Location</p>
                    <p className='text-primary/70'>12 Tran Hung Dao, Hoan Kiem, Ha Noi</p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <FaPhoneAlt className='text-accent mt-1' />
                  <div>
                    <p className='font-semibold'>Reservations</p>
                    <p className='text-primary/70'>+84 24 1234 5678</p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <FaSpa className='text-accent mt-1' />
                  <div>
                    <p className='font-semibold'>Email</p>
                    <p className='text-primary/70'>spa@adinahotel.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-accent/10 p-8 border border-accent/20'>
              <h3 className='font-primary text-xl mb-3'>What to Expect</h3>
              <ul className='space-y-2 text-sm text-primary/70'>
                <li className='flex items-start gap-2'>
                  <FaCheck className='text-accent mt-1' />
                  <span>Arrive 15 minutes early for check-in</span>
                </li>
                <li className='flex items-start gap-2'>
                  <FaCheck className='text-accent mt-1' />
                  <span>Complimentary robe and slippers provided</span>
                </li>
                <li className='flex items-start gap-2'>
                  <FaCheck className='text-accent mt-1' />
                  <span>Silence your phone for a peaceful experience</span>
                </li>
                <li className='flex items-start gap-2'>
                  <FaCheck className='text-accent mt-1' />
                  <span>Hydrate before and after treatments</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='bg-white py-20'>
        <div className='container mx-auto px-6 lg:px-0'>
          <div className='text-center mb-12'>
            <p className='font-tertiary uppercase tracking-[4px] text-xs text-primary/70 mb-2'>
              Guest Reviews
            </p>
            <h2 className='font-primary text-4xl mb-4'>What Our Guests Say</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <div key={index} className='bg-[#f7f4ef] p-6 border border-[#eadfcf]'>
                <div className='flex items-center gap-1 mb-3'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className='text-accent' />
                  ))}
                </div>
                <p className='text-primary/70 mb-4 italic'>&quot;{testimonial.comment}&quot;</p>
                <p className='font-semibold text-primary'>{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showQRPayment && currentBooking && (
        <QRPayment
          bookingData={currentBooking}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={handleCloseQRPayment}
          type="spa"
        />
      )}

      {showInvoice && currentBooking && (
        <Invoice
          booking={currentBooking}
          onClose={() => setShowInvoice(false)}
          onDownload={() => {
            setToast({ type: 'success', message: 'PDF downloaded successfully!' });
          }}
        />
      )}
    </div>
  );
};

export default SpaPage;

