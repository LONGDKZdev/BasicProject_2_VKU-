/**
 * Image Helper Hooks & Utilities
 * For use in React components
 */

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  getRoomImageByType,
  getRoomGallery,
  getAmenitiesFromDB,
  getUserAvatarUrl,
} from './assetUrls';

/**
 * Hook: Load room images
 * Usage: const { images, loading } = useRoomImages(roomTypeId)
 */
export const useRoomImages = (roomTypeId) => {
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const data = await getRoomImageByType(roomTypeId, supabase);
        setImages(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (roomTypeId) {
      fetchImages();
    }
  }, [roomTypeId]);

  return { images, loading, error };
};

/**
 * Hook: Load room gallery
 * Usage: const { gallery, loading } = useRoomGallery(roomTypeId)
 */
export const useRoomGallery = (roomTypeId) => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const data = await getRoomGallery(roomTypeId, supabase);
        setGallery(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (roomTypeId) {
      fetchGallery();
    }
  }, [roomTypeId]);

  return { gallery, loading, error };
};

/**
 * Hook: Load amenities
 * Usage: const { amenities, loading } = useAmenities()
 */
export const useAmenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoading(true);
        const data = await getAmenitiesFromDB(supabase);
        setAmenities(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  return { amenities, loading, error };
};

/**
 * Hook: Load user avatar
 * Usage: const { avatar } = useUserAvatar(user.avatar)
 */
export const useUserAvatar = (avatarUrl) => {
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    setAvatar(getUserAvatarUrl(avatarUrl));
  }, [avatarUrl]);

  return { avatar };
};

/**
 * Hook: Image with lazy loading
 * Usage: const { isInView, ref } = useInViewImage()
 */
export const useInViewImage = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useCallback(
    (node) => {
      if (!node) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(node);
        }
      });

      observer.observe(node);
    },
    []
  );

  return { isInView, ref };
};