import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUsers, FaRuler } from 'react-icons/fa';
import { useRoomImages } from '../utils/imageHelpers';
import { STATIC_ASSETS } from '../utils/assetUrls';

const Room = ({ room }) => {
  const { images, loading: imagesLoading } = useRoomImages(room.room_type_id);
  const [rating, setRating] = useState(4.0);

  useEffect(() => {
    // In future: fetch actual rating from database
    setRating(parseFloat((Math.random() * 2 + 3).toFixed(1)));
  }, [room.id]);

  const displayImage = images?.full || images?.thumbnail || STATIC_ASSETS.placeholder;

  return (
    <div className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-200">
        {imagesLoading ? (
          <div className="w-full h-full animate-pulse bg-gray-300 flex items-center justify-center">
            <span className="text-gray-400">Loading image...</span>
          </div>
        ) : (
          <img
            src={displayImage}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = STATIC_ASSETS.placeholder;
            }}
          />
        )}

        {/* Room Type Badge */}
        <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {room.room_types?.code || room.type || 'ROOM'}
        </div>

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            to={`/room/${room.id}`}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Room Name */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition">
          {room.name}
        </h3>

        {/* Room Type Name */}
        {room.room_types?.name && (
          <p className="text-sm text-gray-500 mb-3">{room.room_types.name}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`${i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'}`}
                size={16}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">{rating} ({Math.floor(Math.random() * 50 + 10)} reviews)</span>
        </div>

        {/* Room Details */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600 border-t border-b border-gray-200 py-4">
          <div className="flex items-center gap-2">
            <FaRuler className="text-amber-500" />
            <span>{room.size || 35}m²</span>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-amber-500" />
            <span>Max {room.room_types?.max_person || 2}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-amber-500" />
            <span>Floor {room.floor || 1}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">
          {room.description || room.room_types?.description || 'Comfortable and well-equipped room.'}
        </p>

        {/* Price & Button */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
          <div>
            <p className="text-gray-500 text-sm">From</p>
            <p className="text-2xl font-bold text-amber-600">
              ${room.price || room.room_types?.base_price || 115}
              <span className="text-sm text-gray-500">/night</span>
            </p>
          </div>
          <Link
            to={`/room/${room.id}`}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Room;