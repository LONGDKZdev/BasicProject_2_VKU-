/**
 * Asset URLs Management
 * All assets are loaded from Supabase Storage
 * No local assets - everything is database-driven
 */

const SUPABASE_BASE = 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms';

/**
 * Static Assets (logos, icons, etc.)
 * These are fetched from Supabase, not local
 */
export const STATIC_ASSETS = {
  // Logos
  logoLight: `${SUPABASE_BASE}/img/logo-white.svg`,
  logoDark: `${SUPABASE_BASE}/img/logo-dark.svg`,

  // Hero slider images
  heroSlider: [
    `${SUPABASE_BASE}/img/heroSlider/1-lg.png`,
    `${SUPABASE_BASE}/img/heroSlider/2-lg.png`,
    `${SUPABASE_BASE}/img/heroSlider/3-lg.png`,
  ],

  // Placeholder for missing images
  placeholder: `${SUPABASE_BASE}/img/room.jpg`,
};

/**
 * Room Images by Room Type Code
 * Usage: getRoomImageByCode('STD')
 */
export const getRoomImageByCode = (code) => {
  const codeMap = {
    STD: 1,
    DLX: 2,
    SUI: 3,
    PEN: 4,
    CMB: 5,
  };

  const imageNum = codeMap[code] || 1;

  return {
    thumbnail: `${SUPABASE_BASE}/img/rooms/${imageNum}.png`,
    full: `${SUPABASE_BASE}/img/rooms/${imageNum}-lg.png`,
  };
};

/**
 * Room Images by Room Type ID (from database)
 * Usage: getRoomImageById(roomTypeId) - fetch from room_images table
 */
export const getRoomImageByType = async (roomTypeId, supabase) => {
  try {
    if (!supabase) {
      console.warn('Supabase client not provided');
      return {
        thumbnail: STATIC_ASSETS.placeholder,
        full: STATIC_ASSETS.placeholder,
      };
    }

    const { data, error } = await supabase
      .from('room_images')
      .select('image_url, image_lg_url')
      .eq('room_type_id', roomTypeId)
      .order('display_order', { ascending: true })
      .limit(1);

    if (error || !data || data.length === 0) {
      return {
        thumbnail: STATIC_ASSETS.placeholder,
        full: STATIC_ASSETS.placeholder,
      };
    }

    return {
      thumbnail: data[0].image_url,
      full: data[0].image_lg_url,
    };
  } catch (err) {
    console.error('Error fetching room image:', err);
    return {
      thumbnail: STATIC_ASSETS.placeholder,
      full: STATIC_ASSETS.placeholder,
    };
  }
};

/**
 * Get all room images for a room type (for gallery)
 * Usage: getRoomGallery(roomTypeId, supabase)
 */
export const getRoomGallery = async (roomTypeId, supabase) => {
  try {
    if (!supabase) {
      console.warn('Supabase client not provided');
      return [];
    }

    const { data, error } = await supabase
      .from('room_images')
      .select('id, image_url, image_lg_url, display_order')
      .eq('room_type_id', roomTypeId)
      .order('display_order', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((img) => ({
      id: img.id,
      thumbnail: img.image_url,
      full: img.image_lg_url,
      order: img.display_order,
    }));
  } catch (err) {
    console.error('Error fetching room gallery:', err);
    return [];
  }
};

/**
 * User Avatar URL
 * Usage: getUserAvatarUrl(user.avatar)
 */
export const getUserAvatarUrl = (avatarUrl) => {
  // If user has custom avatar URL from Supabase, use it
  if (avatarUrl && avatarUrl.startsWith('http')) {
    return avatarUrl;
  }

  // Otherwise return placeholder
  return `${SUPABASE_BASE}/img/placeholder-avatar.png`;
};

/**
 * Get all amenity icons from database
 * Usage: getAmenityIcon(amenity.icon_name)
 */
export const getAmenityIcon = (iconName) => {
  // Map icon names to React Icons
  // These are imported from react-icons/fa
  const iconMap = {
    FaWifi: 'FaWifi',
    FaCoffee: 'FaCoffee',
    FaBath: 'FaBath',
    FaParking: 'FaParking',
    FaSwimmingPool: 'FaSwimmingPool',
    FaHotdog: 'FaHotdog',
    FaStopwatch: 'FaStopwatch',
    FaCocktail: 'FaCocktail',
  };

  return iconMap[iconName] || 'FaCheck';
};

/**
 * Amenity data from database
 * Usage: Should fetch from supabase amenities table instead
 */
export const getAmenitiesFromDB = async (supabase) => {
  try {
    if (!supabase) {
      console.warn('Supabase client not provided');
      return [];
    }

    const { data, error } = await supabase
      .from('amenities')
      .select('id, name, icon_name')
      .order('name', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  } catch (err) {
    console.error('Error fetching amenities:', err);
    return [];
  }
};

/**
 * Get promotion/discount images (if any)
 * Usage: getPromotionImage(promoCode)
 */
export const getPromotionImage = (promoCode) => {
  return `${SUPABASE_BASE}/img/promotions/${promoCode}.png`;
};

/**
 * Certificate/Award images
 * Usage: getAwardImage(awardName)
 */
export const getAwardImage = (awardName) => {
  return `${SUPABASE_BASE}/img/awards/${awardName}.png`;
};

/**
 * Service images (restaurant, spa, etc.)
 * Usage: getServiceImage(serviceName)
 */
export const getServiceImage = (serviceName) => {
  return `${SUPABASE_BASE}/img/services/${serviceName}.png`;
};

/**
 * Validate if image URL exists
 * Usage: await isImageValid(imageUrl)
 */
export const isImageValid = async (imageUrl) => {
  try {
    if (!imageUrl) return false;

    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (err) {
    console.error('Image validation error:', err);
    return false;
  }
};

/**
 * Get image with fallback
 * Usage: getImageWithFallback(primaryUrl, fallbackUrl)
 */
export const getImageWithFallback = async (primaryUrl, fallbackUrl = STATIC_ASSETS.placeholder) => {
  const isValid = await isImageValid(primaryUrl);
  return isValid ? primaryUrl : fallbackUrl;
};