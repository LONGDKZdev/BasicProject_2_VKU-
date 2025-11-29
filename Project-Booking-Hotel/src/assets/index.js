// ⚠️ DEPRECATED: Room images now come from Supabase Storage
// All room image imports removed - use supabaseStorageUrls.js instead

import Slider1 from './img/heroSlider/1.jpg';
import Slider2 from './img/heroSlider/2.jpg';
import Slider3 from './img/heroSlider/3.jpg';

// Logo exports - still using local SVGs
export { ReactComponent as LogoDark } from './img/logo-dark.svg';
export { ReactComponent as LogoWhite } from './img/logo-white.svg';

const images = {
    Slider1,
    Slider2,
    Slider3,
    // Room images removed - they now come from Supabase Storage
}

export default images;