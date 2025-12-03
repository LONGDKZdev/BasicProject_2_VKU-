import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUsers, FaRuler, FaCheck, FaTimes, FaArrowLeft, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useRoomGallery } from '../utils/imageHelpers';
import { supabase } from '../utils/supabaseClient';
import Toast from '../components/Toast';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const { gallery } = useRoomGallery(room?.room_type_id);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('rooms')
          .select(`
            *,
            room_types:room_type_id (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Room not found');

        setRoom(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching room:', err);
        setError(err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoom();
    }
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!room?.room_type_id) return;

      try {
        setReviewsLoading(true);
        const { data, error } = await supabase
          .from('room_reviews')
          .select('*')
          .eq('room_type_id', room.room_type_id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [room?.room_type_id]);

  const handleBooking = () => {
    if (!isAuthenticated()) {
      setToast({
        message: 'Please login to book a room',
        type: 'info',
        duration: 3000,
      });
      navigate('/login', { state: { from: { pathname: `/room/${id}` } } });
      return;
    }

    // Redirect to booking page or modal
    navigate('/rooms', { state: { selectedRoomId: id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/rooms')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Room not found</h1>
          <Link to="/rooms" className="text-amber-600 hover:underline mt-4">
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  const amenities = room.room_types?.facilities || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 4.0;

  return (
    <div className="min-h-screen bg-white">
      <Toast message={toast?.message} type={toast?.type} duration={toast?.duration} />

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/rooms')}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold transition"
          >
            <FaArrowLeft /> Back to Rooms
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery - Left Side */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="mb-6">
              <img
                src={gallery[selectedImage]?.full || gallery[0]?.full}
                alt={room.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                }}
              />
            </div>

            {/* Thumbnail Gallery */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mb-8">
                {gallery.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative overflow-hidden rounded-lg ${
                      selectedImage === idx ? 'ring-2 ring-amber-600' : 'ring-1 ring-gray-200'
                    }`}
                  >
                    <img
                      src={img.thumbnail}
                      alt={`Room view ${idx + 1}`}
                      className="w-full h-24 object-cover hover:scale-110 transition-transform"
                      onError={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Room Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{room.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`${i < Math.floor(avgRating) ? 'text-amber-400' : 'text-gray-300'}`}
                      size={18}
                    />
                  ))}
                </div>
                <span className="text-gray-600">{avgRating} ({reviews.length} reviews)</span>
              </div>

              <p className="text-gray-600 text-lg mb-6">{room.description || room.room_types?.description}</p>

              {/* Room Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <FaRuler className="text-amber-600 text-2xl mb-2" />
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="font-bold text-lg text-gray-800">{room.size || 35}m²</p>
                </div>
                <div>
                  <FaUsers className="text-amber-600 text-2xl mb-2" />
                  <p className="text-sm text-gray-500">Max Guests</p>
                  <p className="font-bold text-lg text-gray-800">{room.room_types?.max_person || 2}</p>
                </div>
                <div>
                  <FaMapMarkerAlt className="text-amber-600 text-2xl mb-2" />
                  <p className="text-sm text-gray-500">Floor</p>
                  <p className="font-bold text-lg text-gray-800">{room.floor || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Room No</p>
                  <p className="font-bold text-lg text-gray-800">{room.room_no}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <FaCheck className="text-amber-600 text-lg flex-shrink-0" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Guest Reviews</h2>
              {reviewsLoading ? (
                <p className="text-gray-600">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-l-4 border-amber-500 pl-4 py-3 bg-gray-50 rounded-r">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{review.user_name || 'Anonymous'}</h3>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`${i < review.rating ? 'text-amber-400' : 'text-gray-300'}`}
                              size={14}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      <p className="text-gray-400 text-xs mt-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Card - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-600 text-sm mb-1">Price per night</p>
                <p className="text-4xl font-bold text-amber-600">
                  ${room.price || room.room_types?.base_price || 115}
                </p>
              </div>

              {/* Room Type */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Room Type</p>
                <p className="text-xl font-bold text-gray-800">{room.room_types?.name}</p>
              </div>

              {/* Booking Button */}
              <button
                onClick={handleBooking}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 rounded-lg transition mb-4"
              >
                Book Now
              </button>

              {/* Additional Info */}
              <div className="space-y-3 text-sm text-gray-600 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  <span>Free cancellation up to 48h before</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  <span>No prepayment needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  <span>Instant confirmation</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <p className="text-sm font-semibold text-gray-800 mb-3">Need help?</p>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm"
                >
                  <FaPhone /> +1 (234) 567-890
                </a>
                <a
                  href="mailto:info@adina.com"
                  className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm"
                >
                  <FaEnvelope /> info@adina.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;