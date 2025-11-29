import { BsArrowsFullscreen, BsPeople } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { roomCategories } from "../db/data";

// Placeholder image - will be replaced by Supabase Storage URL
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='18' fill='%23999' text-anchor='middle' dy='.3em'%3ELoading image...%3C/text%3E%3C/svg%3E";

const Room = ({ room }) => {
  const {
    id,
    name,
    image,
    size,
    maxPerson,
    description,
    price,
    reviews,
    category,
  } = room ?? {};
  
  const averageRating = reviews?.length
    ? (
        reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      ).toFixed(1)
    : null;

  const categoryData = roomCategories.find((cat) => cat.id === category);

  // Use Supabase Storage URL if available, fallback to placeholder
  const displayImage = image || PLACEHOLDER_IMG;

  return (
    <div className="bg-white shadow-2xl min-h-[500px] group relative">
      <div className="overflow-hidden">
        <img
          src={displayImage}
          alt={name || "room"}
          className="group-hover:scale-110 transition-all duration-300 w-full object-cover h-64"
          onError={(e) => {
            // Fallback if image URL fails to load
            console.warn('❌ Image failed to load from Supabase:', displayImage);
            e.target.src = PLACEHOLDER_IMG;
          }}
        />
        {categoryData && (
          <div className="absolute top-4 right-4 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[1px]">
            {categoryData.name}
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
              <div>{size}m2</div>
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <div className="text-accent">
              <BsPeople className="text-[18px]" />
            </div>
            <div className="flex gap-x-1">
              <div>Max people</div>
              <div>{maxPerson}</div>
            </div>
          </div>
        </div>
      </div>

      {/* name and description */}
      <div className="text-center px-6">
        <Link to={`/room/${id}`}>
          <h3 className="h3">{name}</h3>
        </Link>

        {room?.type && (
          <p className="text-xs uppercase tracking-[3px] text-primary/60 mb-2">
            {room.type}
          </p>
        )}
        <p className="max-w-[300px] mx-auto mb-3 lg:mb-6">
          {description.slice(0, 56)}..
        </p>
        <div className="flex justify-center items-center gap-2 mb-4 text-sm text-primary/80">
          <div className="flex items-center gap-1 text-accent">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`${
                  averageRating && index < Math.round(averageRating)
                    ? "text-accent"
                    : "text-accent/30"
                }`}
              />
            ))}
          </div>
          <span>
            {averageRating
              ? `${averageRating} • ${reviews.length} reviews`
              : "Be the first to review"}
          </span>
        </div>
      </div>

      {/* button */}
      <Link
        to={`/room/${id}`}
        className="btn btn-secondary btn-sm max-w-[240px] mx-auto duration-300"
      >
        Book now from ${price}
      </Link>
    </div>
  );
};

export default Room;
