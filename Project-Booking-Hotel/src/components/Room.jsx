import { BsArrowsFullscreen, BsPeople } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getImageUrlsByRoomType } from "../utils/supabaseStorageUrls";

const STORAGE_URL = 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms';
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='18' fill='%23999' text-anchor='middle' dy='.3em'%3ELoading image...%3C/text%3E%3C/svg%3E";

/**
 * Generate fallback image URL based on room type or number
 */
const getFallbackImageUrl = (roomNo, type) => {
  if (!type) {
    // Try to extract number from roomNo (e.g., "STD-01" -> 1, "DLX-05" -> 5)
    if (roomNo) {
      const match = roomNo.match(/\d+/);
      if (match) {
        const imgIndex = parseInt(match[0]) % 8 || 1;
        return `${STORAGE_URL}/${imgIndex === 0 ? 8 : imgIndex}-lg.png`;
      }
    }
    return PLACEHOLDER_IMG;
  }
  
  // Use room type to get image URL
  const imageUrls = getImageUrlsByRoomType(type);
  return imageUrls?.image_lg_url || imageUrls?.image_url || PLACEHOLDER_IMG;
};

const Room = ({ room }) => {
  if (!room) return null;

  const {
    id,
    roomNo,
    name,
    image,
    size,
    maxPerson,
    description,
    price,
    type,
    reviews,
  } = room;

  // Use Supabase image URL if available, otherwise use fallback
  const displayImage = image || getFallbackImageUrl(roomNo, type);

  // Calculate average rating from reviews
  const averageRating = reviews && reviews.length > 0
    ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 4;

  return (
    <div className="bg-white shadow-2xl min-h-[500px] group relative">
      <div className="overflow-hidden">
        <img
          src={displayImage}
          alt={name || "room"}
          className="group-hover:scale-110 transition-all duration-300 w-full object-cover h-64"
          loading="lazy"
          onError={(e) => {
            // If error occurs, try fallback URL first, then use placeholder
            if (e.target.src !== PLACEHOLDER_IMG && e.target.src !== getFallbackImageUrl(roomNo, type)) {
              console.warn('Image failed to load, trying fallback:', displayImage);
              e.target.src = getFallbackImageUrl(roomNo, type);
            } else {
              console.warn('All image sources failed, using placeholder');
              e.target.src = PLACEHOLDER_IMG;
            }
          }}
        />
        {type && (
          <div className="absolute top-4 right-4 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[1px]">
            {type}
          </div>
        )}
      </div>

      <div className="bg-white shadow-lg max-w-[300px] mx-auto h-[60px] -translate-y-1/2 flex justify-center items-center uppercase font-tertiary tracking-[1px] font-semibold text-base">
        <div className="flex justify-between w-[80%]">
          <div className="flex items-center gap-x-2">
            <div className="text-accent">
              <BsArrowsFullscreen className="text-[15px]" />
            </div>
            <div className="flex gap-x-1">
              <div>Size</div>
              <div>{size || 0}m²</div>
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <div className="text-accent">
              <BsPeople className="text-[18px]" />
            </div>
            <div className="flex gap-x-1">
              <div>Max people</div>
              <div>{maxPerson || 2}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center px-6">
        <Link to={`/room/${roomNo || id}`}>
          <h3 className="h3">{name || 'Standard Room'}</h3>
        </Link>

        {type && (
          <p className="text-xs uppercase tracking-[3px] text-primary/60 mb-2">
            {type} Room
          </p>
        )}
        <p className="max-w-[300px] mx-auto mb-3 lg:mb-6">
          {description ? description.slice(0, 56) : 'Comfortable room with modern amenities'}..
        </p>
        <div className="flex justify-center items-center gap-2 mb-4 text-sm text-primary/80">
          <div className="flex items-center gap-1 text-accent">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`${
                  index < averageRating ? "text-accent" : "text-accent/30"
                }`}
              />
            ))}
          </div>
          <span>{averageRating}.0 • {reviews?.length || 0} reviews</span>
        </div>
      </div>

      <Link
        to={`/room/${roomNo || id}`}
        className="btn btn-secondary btn-sm max-w-[240px] mx-auto duration-300"
      >
        Book now from ${(price || 0).toFixed(2)}
      </Link>
    </div>
  );
};

export default Room;