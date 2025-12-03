import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { STATIC_ASSETS } from '../utils/assetUrls';

const HeroSlider = () => {
  const [sliderData, setSliderData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load slider data from STATIC_ASSETS
    const slides = [
      {
        id: 1,
        title: 'Luxury Rooms',
        subtitle: 'Experience ultimate comfort',
        image: STATIC_ASSETS.heroSlider[0],
      },
      {
        id: 2,
        title: 'World Class Dining',
        subtitle: 'Culinary excellence awaits',
        image: STATIC_ASSETS.heroSlider[1],
      },
      {
        id: 3,
        title: 'Spa & Wellness',
        subtitle: 'Rejuvenate your body and soul',
        image: STATIC_ASSETS.heroSlider[2],
      },
    ];

    setSliderData(slides);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen max-h-[600px] overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          el: '.swiper-pagination',
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="h-full"
      >
        {sliderData.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            {/* Background Image */}
            <img
              className="object-cover h-full w-full"
              src={slide.image}
              alt={slide.title}
              loading={slide.id === 1 ? 'eager' : 'lazy'}
              onError={(e) => {
                e.target.style.backgroundColor = '#d4a574';
                e.target.style.color = 'white';
              }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-100 drop-shadow-md">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Arrows */}
        <div className="swiper-button-prev absolute left-4 z-10 !text-white !w-12 !h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition"></div>
        <div className="swiper-button-next absolute right-4 z-10 !text-white !w-12 !h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition"></div>

        {/* Pagination */}
        <div className="swiper-pagination absolute bottom-8 !w-full flex justify-center gap-2"></div>
      </Swiper>
    </div>
  );
};

export default HeroSlider;