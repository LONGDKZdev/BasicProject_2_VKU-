import { useState, useEffect } from "react";
import { ScrollToTop, Toast } from "../components";
import QRPayment from "../components/QRPayment";
import Invoice from "../components/Invoice";
import ServiceSelector from "../components/ServiceSelector";
import AvailabilityViewer from "../components/AvailabilityViewer";
import { useBookingContext } from "../context/BookingContext";
import { useAuth } from "../context/SimpleAuthContext";
import {
  fetchRestaurantMenuItems,
  fetchRestaurantSlotsByDateTime,
  updateRestaurantSlotUsage,
} from "../services/bookingService";
// ⚠️ Local images removed - now use Supabase URLs

const STORAGE_URL = "https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms";
const PLACEHOLDER_IMG_MENU = "https://via.placeholder.com/400x300?text=Menu+Image";
import {
  FaUtensils,
  FaWineGlassAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaCheck,
} from "react-icons/fa";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23ddd' width='300' height='200'/%3E%3Ctext x='50%' y='50%' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3EMenu Image%3C/text%3E%3C/svg%3E";

// Helper function to get image for menu items (using Supabase Storage URLs)
const getMenuItemImage = (id, imageUrl = null, displayOrder = null) => {
  // If image_url from DB is valid and NOT a placeholder, use it
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('via.placeholder.com')) {
    return imageUrl;
  }
  
  // Fallback: Use display_order or hash id to cycle through images 1-8
  // Images are named 1-lg.png through 8-lg.png for large format
  if (!id) return PLACEHOLDER_IMG_MENU;
  
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
    img.onerror = () => console.warn(`[Restaurant] Image not found: ${finalUrl}`);
    img.onload = () => console.log(`[Restaurant] Image loaded: ${finalUrl}`);
    img.src = finalUrl;
  }
  return finalUrl;
};


const menuCategories = [
  { id: "appetizers", name: "Appetizers", icon: FaUtensils },
  { id: "mains", name: "Main Courses", icon: FaUtensils },
  { id: "desserts", name: "Desserts", icon: FaUtensils },
  { id: "beverages", name: "Beverages", icon: FaWineGlassAlt },
  { id: "combos", name: "Combo Meals", icon: FaUtensils },
];

const menuItems = {
  appetizers: [
    {
      id: 1,
      name: "Truffle Arancini",
      description: "Crispy risotto balls with black truffle and parmesan",
      price: 28,
      popular: true,
      image: getMenuItemImage(1),
    },
    {
      id: 2,
      name: "Wagyu Beef Carpaccio",
      description: "Thinly sliced premium wagyu with arugula and truffle oil",
      price: 45,
      popular: true,
      image: getMenuItemImage(2),
    },
    {
      id: 3,
      name: "Lobster Bisque",
      description: "Creamy bisque with cognac and fresh herbs",
      price: 32,
      image: getMenuItemImage(3),
    },
    {
      id: 4,
      name: "Foie Gras Terrine",
      description: "Duck liver terrine with fig compote and brioche",
      price: 38,
      image: getMenuItemImage(4),
    },
    {
      id: 5,
      name: "Oysters Rockefeller",
      description: "Fresh oysters with spinach, herbs, and pernod",
      price: 35,
      image: getMenuItemImage(5),
    },
  ],
  mains: [
    {
      id: 6,
      name: "Wagyu Ribeye Steak",
      description:
        "Premium 300g ribeye with roasted vegetables and red wine jus",
      price: 95,
      popular: true,
      image: getMenuItemImage(6),
    },
    {
      id: 7,
      name: "Pan-Seared Sea Bass",
      description:
        "Wild-caught sea bass with lemon beurre blanc and seasonal vegetables",
      price: 68,
      image: getMenuItemImage(7),
    },
    {
      id: 8,
      name: "Duck Confit",
      description: "Slow-cooked duck leg with cherry sauce and potato gratin",
      price: 72,
      image: getMenuItemImage(8),
    },
    {
      id: 9,
      name: "Lobster Thermidor",
      description: "Whole lobster with gruyère cheese and brandy cream",
      price: 88,
      popular: true,
      image: getMenuItemImage(9),
    },
    {
      id: 10,
      name: "Vegetarian Risotto",
      description:
        "Creamy arborio rice with seasonal vegetables and truffle oil",
      price: 42,
      image: getMenuItemImage(10),
    },
    {
      id: 11,
      name: "Rack of Lamb",
      description:
        "Herb-crusted lamb with mint jus and roasted root vegetables",
      price: 78,
      image: getMenuItemImage(11),
    },
  ],
  desserts: [
    {
      id: 12,
      name: "Chocolate Soufflé",
      description: "Warm dark chocolate soufflé with vanilla ice cream",
      price: 24,
      popular: true,
      image: getMenuItemImage(12),
    },
    {
      id: 13,
      name: "Crème Brûlée",
      description: "Classic vanilla custard with caramelized sugar",
      price: 18,
      image: getMenuItemImage(13),
    },
    {
      id: 14,
      name: "Tiramisu",
      description: "Traditional Italian dessert with espresso and mascarpone",
      price: 22,
      image: getMenuItemImage(14),
    },
    {
      id: 15,
      name: "Lemon Tart",
      description: "Tangy lemon curd in buttery pastry with fresh berries",
      price: 20,
      image: getMenuItemImage(15),
    },
    {
      id: 16,
      name: "Cheese Selection",
      description: "Artisan cheeses with honey, nuts, and crackers",
      price: 32,
      image: getMenuItemImage(16),
    },
  ],
  beverages: [
    {
      id: 17,
      name: "Wine Selection",
      description: "Curated wines from renowned vineyards",
      price: 45,
      popular: true,
      image: getMenuItemImage(17),
    },
    {
      id: 18,
      name: "Craft Cocktails",
      description: "Signature cocktails crafted by our mixologist",
      price: 18,
      image: getMenuItemImage(18),
    },
    {
      id: 19,
      name: "Champagne",
      description: "Premium champagne selection",
      price: 120,
      image: getMenuItemImage(19),
    },
    {
      id: 20,
      name: "Fresh Juices",
      description: "Seasonal fresh fruit juices",
      price: 12,
      image: getMenuItemImage(20),
    },
    {
      id: 21,
      name: "Espresso & Tea",
      description: "Premium coffee and tea selection",
      price: 8,
      image: getMenuItemImage(21),
    },
  ],
  combos: [
    {
      id: 22,
      name: "Romantic Dinner for Two",
      description: "Appetizer, two main courses, dessert, and wine pairing",
      price: 220,
      popular: true,
      image: getMenuItemImage(22),
      items: [
        "Wagyu Beef Carpaccio",
        "Wagyu Ribeye Steak",
        "Pan-Seared Sea Bass",
        "Chocolate Soufflé",
        "Wine Selection",
      ],
    },
    {
      id: 23,
      name: "Family Feast",
      description:
        "Perfect for 4 people: appetizers, mains, desserts, and beverages",
      price: 380,
      popular: true,
      image: getMenuItemImage(23),
      items: [
        "Truffle Arancini",
        "Lobster Thermidor",
        "Duck Confit",
        "Rack of Lamb",
        "Tiramisu",
        "Crème Brûlée",
        "Fresh Juices",
      ],
    },
    {
      id: 24,
      name: "Seafood Lovers",
      description: "Lobster bisque, sea bass, lobster thermidor, and champagne",
      price: 280,
      image: getMenuItemImage(24),
      items: [
        "Lobster Bisque",
        "Pan-Seared Sea Bass",
        "Lobster Thermidor",
        "Champagne",
      ],
    },
    {
      id: 25,
      name: "Vegetarian Delight",
      description:
        "Complete vegetarian menu with seasonal vegetables and risotto",
      price: 120,
      image: getMenuItemImage(25),
      items: [
        "Vegetarian Risotto",
        "Seasonal Salad",
        "Lemon Tart",
        "Fresh Juices",
      ],
    },
    {
      id: 26,
      name: "Business Lunch",
      description:
        "Quick and elegant lunch combo: appetizer, main, and dessert",
      price: 85,
      image: getMenuItemImage(26),
      items: [
        "Truffle Arancini",
        "Wagyu Ribeye Steak",
        "Crème Brûlée",
        "Espresso & Tea",
      ],
    },
  ],
};

const chefSpecials = [
  {
    title: "Chef's Tasting Menu",
    description:
      "A curated 7-course journey showcasing seasonal ingredients and culinary artistry",
    price: 185,
    duration: "2.5 hours",
    includes: ["7 courses", "Wine pairing option", "Chef interaction"],
    image: getMenuItemImage(27),
  },
  {
    title: "Weekend Brunch",
    description:
      "Indulgent brunch experience with bottomless mimosas and live jazz",
    price: 65,
    duration: "11:00 - 15:00",
    includes: [
      "Unlimited brunch items",
      "Bottomless beverages",
      "Live entertainment",
    ],
    image: getMenuItemImage(28),
  },
  {
    title: "Private Dining",
    description:
      "Exclusive private room for intimate gatherings and celebrations",
    price: 250,
    duration: "Custom",
    includes: ["Private room", "Customized menu", "Dedicated service"],
    image: getMenuItemImage(29),
  },
];

const openingHours = [
  { day: "Monday - Thursday", time: "18:00 - 22:30" },
  { day: "Friday - Saturday", time: "18:00 - 23:30" },
  { day: "Sunday", time: "12:00 - 21:00" },
  { day: "Brunch", time: "Saturday & Sunday 11:00 - 15:00" },
];

const RestaurantPage = () => {
  const { user } = useAuth();
  const { createRestaurantBooking, confirmRestaurantBooking } =
    useBookingContext();
  const [categories, setCategories] = useState(menuCategories);
  const [menuData, setMenuData] = useState(menuItems);
  const [activeCategory, setActiveCategory] = useState("appetizers");
  const [toast, setToast] = useState(null);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    specialRequests: "",
  });

  // Auto-fill form when user is logged in
  useEffect(() => {
    if (user) {
      setReservationForm((prev) => ({
        ...prev,
        name: user.full_name || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Load menu items from Supabase (fallback to static if fails)
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await fetchRestaurantMenuItems();
        if (!data || data.length === 0) return;

        const catSet = Array.from(
          new Set(
            data
              .map((i) => i.category || "others")
              .map((c) => c.toLowerCase())
          )
        );
        const mappedCategories = catSet.map((c) => ({
          id: c,
          name: c.charAt(0).toUpperCase() + c.slice(1),
          icon: c.includes("beverage") ? FaWineGlassAlt : FaUtensils,
        }));
        const grouped = data.reduce((acc, item) => {
          const key = (item.category || "others").toLowerCase();
          acc[key] = acc[key] || [];
          acc[key].push({
            id: item.id,
            name: item.name,
            description: item.description,
            price: Number(item.price) || 0,
            popular: item.popular || false,
            image: getMenuItemImage(item.id, item.image_url, item.display_order),
            items: item.items || [],
          });
          return acc;
        }, {});

        setCategories(mappedCategories);
        setMenuData(grouped);
        setActiveCategory(mappedCategories[0]?.id || "appetizers");
      } catch (err) {
        console.warn("Fallback to static menu, fetch error:", err);
      }
    };
    loadMenu();
  }, []);

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    if (
      !reservationForm.name ||
      !reservationForm.email ||
      !reservationForm.date ||
      !reservationForm.time
    ) {
      setToast({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    const guests = parseInt(reservationForm.guests, 10) || 1;
    // Ensure proper ISO format: YYYY-MM-DDTHH:MM:SS
    const reservationAt = reservationForm.date && reservationForm.time 
      ? `${reservationForm.date}T${reservationForm.time}:00` 
      : `${reservationForm.date}T${reservationForm.time}`;

    // Require table selection
    if (!selectedTable) {
      setToast({
        type: "error",
        message: "Please select a table from the available tables above.",
      });
      return;
    }

    // Use selected table
    const slots = await fetchRestaurantSlotsByDateTime(reservationAt);
    const availableSlot = slots.find(s => s.id === selectedTable.slotId);

    if (!availableSlot) {
      setToast({
        type: "error",
        message: "Selected table is no longer available. Please select another table.",
      });
      setSelectedTable(null);
      return;
    }

    // Check capacity
    if ((availableSlot.capacity_limit - availableSlot.capacity_used) < guests) {
      setToast({
        type: "error",
        message: `Selected table only has ${availableSlot.capacity_limit - availableSlot.capacity_used} seats available. Please select a larger table.`,
      });
      return;
    }

    // Update slot usage (best-effort)
    await updateRestaurantSlotUsage(availableSlot.id, guests);

    // Price demo: $50/guest if no menu selection
    const price = guests * 50;

    // Create booking through context (which handles confirmation code)
    try {
      const result = createRestaurantBooking({
        name: reservationForm.name,
        email: reservationForm.email,
        phone: reservationForm.phone,
        date: reservationAt,
        guests,
        specialRequests: reservationForm.specialRequests,
        userId: user?.id,
        userName: reservationForm.name,
        userEmail: reservationForm.email,
        price,
        totalPrice: price,
        tableId: availableSlot.table_id, // Pass table_id for reference
        slotId: availableSlot.id, // Pass slot_id for reference
      });

      if (result?.success) {
        setCurrentBooking(result.booking);
        setShowQRPayment(true);
      } else {
        setToast({
          type: "error",
          message: "Failed to create booking. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error in handleReservationSubmit:', error);
      setToast({
        type: "error",
        message: error.message || "Failed to create booking. Please check console for details.",
      });
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    if (!currentBooking) return;

    const confirmedBooking = confirmRestaurantBooking(
      currentBooking.id,
      paymentData
    );
    setCurrentBooking(confirmedBooking);
    setShowQRPayment(false);
    setShowInvoice(true);
    setToast({
      type: "success",
      message: "Payment successful! Your reservation is confirmed.",
    });
    setReservationForm({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      guests: "2",
      specialRequests: "",
    });
  };

  const handleCloseQRPayment = () => {
    setShowQRPayment(false);
    setCurrentBooking(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservationForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <ScrollToTop />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[480px] flex items-center justify-center text-center">
        <img
          src={`${STORAGE_URL}/2-lg.png`}
          alt="Restaurant interior"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-3xl px-6 text-white">
          <p className="font-tertiary uppercase tracking-[6px] text-sm mb-4">
            Adina Hotel & Spa
          </p>
          <h1 className="font-primary text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Fine Dining Experience
          </h1>
          <p className="text-lg text-white/80">
            Indulge in culinary excellence with our award-winning chefs, curated
            wine selection, and elegant ambiance.
          </p>
        </div>
      </section>

      {/* Menu Section */}
      <section className="container mx-auto px-6 lg:px-0 py-20">
        <div className="text-center mb-12">
          <p className="font-tertiary uppercase tracking-[4px] text-xs text-primary/70 mb-2">
            Our Menu
          </p>
          <h2 className="font-primary text-4xl mb-4">Culinary Excellence</h2>
          <p className="text-primary/70 max-w-2xl mx-auto">
            Each dish is crafted with precision, using the finest ingredients
            sourced from local artisans and international purveyors.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 border rounded-full transition ${
                  activeCategory === category.id
                    ? "bg-accent text-white border-accent"
                    : "border-[#eadfcf] text-primary hover:border-accent"
                }`}
              >
                <Icon />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(menuData[activeCategory] || []).map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-sm border border-[#eadfcf] hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    console.error(`[Restaurant] Failed to load image: ${item.image}`);
                    e.target.src = PLACEHOLDER_IMG_MENU;
                  }}
                />
                {item.popular && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-accent text-white px-3 py-1 rounded-full text-xs">
                    <FaStar />
                    <span>Popular</span>
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-primary text-xl mb-2">{item.name}</h3>
                <p className="text-sm text-primary/70 mb-3">
                  {item.description}
                </p>
                {item.items && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-primary/60 mb-1">
                      Includes:
                    </p>
                    <ul className="text-xs text-primary/70 space-y-1">
                      {item.items.map((foodItem, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <FaCheck className="text-accent text-[10px]" />
                          <span>{foodItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="font-primary text-2xl text-accent">
                  ${item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chef's Specials */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 lg:px-0">
          <div className="text-center mb-12">
            <p className="font-tertiary uppercase tracking-[4px] text-xs text-primary/70 mb-2">
              Special Experiences
            </p>
            <h2 className="font-primary text-4xl mb-4">Chef's Specials</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {chefSpecials.map((special, index) => (
              <div
                key={index}
                className="bg-[#f7f4ef] border border-[#eadfcf] hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={special.image}
                    alt={special.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-primary text-2xl mb-3">
                    {special.title}
                  </h3>
                  <p className="text-primary/70 mb-4">{special.description}</p>
                  <div className="mb-4">
                    <p className="font-primary text-3xl text-accent mb-2">
                      ${special.price}
                    </p>
                    <p className="text-sm text-primary/60">
                      {special.duration}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {special.includes.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-primary/70"
                      >
                        <FaCheck className="text-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section className="container mx-auto px-6 lg:px-0 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Reservation Form */}
          <div className="bg-white p-8 shadow-sm border border-[#eadfcf]">
            <p className="font-tertiary uppercase tracking-[4px] text-xs text-primary/70 mb-2">
              Reserve a Table
            </p>
            <h2 className="font-primary text-3xl mb-6">Book Your Experience</h2>
            <form onSubmit={handleReservationSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={reservationForm.name}
                    onChange={handleInputChange}
                    className="w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent"
                    placeholder="John Carter"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={reservationForm.email}
                    onChange={handleInputChange}
                    className="w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={reservationForm.phone}
                    onChange={handleInputChange}
                    className="w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent"
                    placeholder="+84 987 654 321"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Number of Guests *
                  </label>
                  <select
                    name="guests"
                    value={reservationForm.guests}
                    onChange={handleInputChange}
                    className="w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent bg-white"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service/Menu Selection - Integrated in Form */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Select Menu Item (Optional)
                </label>
                <ServiceSelector
                  type="restaurant"
                  items={Object.values(menuData).flat()}
                  selected={selectedMenuItem?.id}
                  onSelect={(item) => setSelectedMenuItem(item)}
                  className="mb-4"
                  maxHeight="200px"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={reservationForm.date}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSelectedTable(null); // Reset table selection when date changes
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={reservationForm.time}
                    onChange={(e) => {
                      handleInputChange(e);
                      setSelectedTable(null); // Reset table selection when time changes
                    }}
                    className="w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              {/* Availability Viewer - Show available tables */}
              {reservationForm.date && reservationForm.time && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Available Tables *
                  </label>
                  <AvailabilityViewer
                    type="restaurant"
                    dateTime={`${reservationForm.date}T${reservationForm.time}`}
                    guests={parseInt(reservationForm.guests, 10) || 1}
                    onSelect={(table) => {
                      setSelectedTable(table);
                      console.log('[Restaurant] Selected table:', table);
                    }}
                    className="mb-4"
                  />
                  {!selectedTable && (
                    <p className="text-xs text-red-500 mt-1">Please select a table to continue</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={reservationForm.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-[#eadfcf] px-4 py-3 focus:outline-none focus:border-accent resize-none"
                  placeholder="Dietary restrictions, celebration, etc."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full uppercase tracking-[4px]"
              >
                Reserve Table
              </button>
            </form>
          </div>

          {/* Restaurant Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 shadow-sm border border-[#eadfcf]">
              <h3 className="font-primary text-2xl mb-6">Opening Hours</h3>
              <div className="space-y-4">
                {openingHours.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between pb-4 border-b border-[#eadfcf] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <FaClock className="text-accent" />
                      <span className="font-semibold">{schedule.day}</span>
                    </div>
                    <span className="text-primary/70">{schedule.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 shadow-sm border border-[#eadfcf]">
              <h3 className="font-primary text-2xl mb-6">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-accent mt-1" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-primary/70">
                      12 Tran Hung Dao, Hoan Kiem, Ha Noi
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaPhoneAlt className="text-accent mt-1" />
                  <div>
                    <p className="font-semibold">Reservations</p>
                    <p className="text-primary/70">+84 24 1234 5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaUtensils className="text-accent mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-primary/70">restaurant@adinahotel.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 p-8 border border-accent/20">
              <h3 className="font-primary text-xl mb-3">Dress Code</h3>
              <p className="text-primary/70 text-sm">
                Smart casual attire is recommended. We kindly request no
                sportswear or beachwear in the dining room.
              </p>
            </div>
          </div>
        </div>
      </section>

      {showQRPayment && currentBooking && (
        <QRPayment
          bookingData={currentBooking}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={handleCloseQRPayment}
          type="restaurant"
        />
      )}

      {showInvoice && currentBooking && (
        <Invoice
          booking={currentBooking}
          onClose={() => setShowInvoice(false)}
          onDownload={() => {
            setToast({
              type: "success",
              message: "PDF downloaded successfully!",
            });
          }}
        />
      )}
    </div>
  );
};

export default RestaurantPage;
