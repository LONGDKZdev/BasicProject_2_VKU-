import { BookForm, Rooms, ScrollToTop, CategoryFilter } from "../components";
import {
  FaCrown,
  FaConciergeBell,
  FaWineGlassAlt,
  FaUmbrellaBeach,
} from "react-icons/fa";
import { useRoomContext } from "../context/RoomContext";
import { useMemo } from "react";

const STORAGE_URL = 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms';

const highlights = [
  {
    title: "Signature Suites",
    description: "Spacious villas with private terraces and curated amenities.",
    icon: FaCrown,
  },
  {
    title: "Butler Service",
    description: "24/7 dedicated hosts ready to personalize every detail.",
    icon: FaConciergeBell,
  },
  {
    title: "Gourmet Moments",
    description:
      "In-room dining with pairing menus from our award-winning chefs.",
    icon: FaWineGlassAlt,
  },
  {
    title: "Resort Experiences",
    description:
      "Private spa rituals, yacht cruises, and sunset lounge access.",
    icon: FaUmbrellaBeach,
  },
];

const stats = [
  { label: "Suites & Villas", value: "80+" },
  { label: "Average Size", value: "120 m²" },
  { label: "Guest Rating", value: "4.9/5" },
  { label: "Concierge Team", value: "24/7" },
];

const RoomsPage = () => {
  const { rooms } = useRoomContext();

  const resultText = useMemo(() => {
    if (!rooms?.length) return "No matching rooms";
    if (rooms.length === 1) return "1 room available";
    return `${rooms.length} rooms available`;
  }, [rooms]);

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <ScrollToTop />

      <section className="relative h-[60vh] min-h-[480px] flex items-center justify-center text-center">
        <img
          src={`${STORAGE_URL}/img/heroSlider/3.jpg`}
          alt="Panoramic hotel suite"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-3xl px-6 text-white">
          <p className="font-tertiary uppercase tracking-[6px] text-sm mb-4">
            Adina Hotel &amp; Spa
          </p>
          <h1 className="font-primary text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Curated Rooms &amp; Bespoke Suites
          </h1>
          <p className="text-lg text-white/80">
            Discover sophisticated residences bathed in natural light with
            handcrafted interiors, premium linens, and immersive smart-home
            comforts.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-0 mt-10 relative z-20">
        <div className="bg-white shadow-2xl border border-white/60">
          <div className="bg-accent/10 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-tertiary uppercase tracking-[4px] text-xs text-primary">
                Plan your stay
              </p>
              <h3 className="font-primary text-2xl">
                Availability &amp; Rates
              </h3>
            </div>
            <p className="text-sm text-primary/70 max-w-sm">
              Select your travel dates and group size to view tailor-made
              options instantly.
            </p>
          </div>
          <div className="p-4 lg:p-6 bg-white">
            <BookForm />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-0 py-20">
        <CategoryFilter />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white shadow-sm border border-[#eadfcf] p-6"
            >
              <p className="font-tertiary uppercase tracking-[3px] text-xs text-primary/70">
                {stat.label}
              </p>
              <p className="font-primary text-4xl text-accent mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="bg-white p-6 shadow-sm border border-[#eadfcf] hover:-translate-y-1 transition-transform duration-300"
            >
              <Icon className="text-accent text-3xl mb-4" />
              <h3 className="font-primary text-xl mb-2">{title}</h3>
              <p className="text-sm text-primary/70 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Rooms />
    </div>
  );
};

export default RoomsPage;