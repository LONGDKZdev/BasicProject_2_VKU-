import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRoomContext } from "../../context/RoomContext";
import { useAuth } from "../../context/SimpleAuthContext";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";
import QRPaymentModal from "../QRPaymentModal";

// AI Response templates for hotel consultation
const AI_RESPONSES = {
  greetings: [
    "Hello! 👋 I'm your booking assistant. I'll help you find the perfect room. What do you need?",
    "Welcome! 🏨 I'm here to provide you with an amazing booking experience.",
  ],
  room_suggestions: [
    "Based on your requirements, I recommend these rooms:",
    "I found rooms that match your needs:",
  ],
  price_inquiry: [
    "Room prices vary by season. Choose dates to see exact pricing!",
    "Best rates on weekdays. Weekend rates are different!",
  ],
  amenities: [
    "🏊 Swimming Pool, 🏋️ Gym, 🍽️ Restaurant, 🧖 Spa",
    "🎰 Casino, 🎪 Tennis Court, 🚴 Bike Rental",
  ],
  special_requests: [
    "I've noted your special request. Our team will contact you soon!",
    "A staff member will reach out to confirm this request.",
  ],
};

const QuickReply = ({ label, onClick, icon = "✓" }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 text-sm rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition transform hover:scale-105 active:scale-95 duration-200 font-medium flex items-center gap-2 whitespace-nowrap"
  >
    <span>{icon}</span>
    {label}
  </button>
);

const ChatMessage = ({ role = "ai", children, timestamp = null }) => {
  const isUser = role === "user";
  return (
    <div
      className={`w-full flex ${
        isUser ? "justify-end" : "justify-start"
      } my-3 animate-fade-in`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-sm"
        }`}
      >
        {children}
        {timestamp && (
          <div
            className={`text-xs mt-1 ${
              isUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="w-full flex justify-start my-3">
    <div className="px-4 py-3 rounded-2xl text-sm bg-gray-100 border border-gray-200 text-gray-500">
      <span className="inline-flex gap-1">
        <span
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></span>
        <span
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></span>
        <span
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></span>
      </span>
    </div>
  </div>
);

const RoomCard = ({ room, onSelect, showPrice = true }) => (
  <div
    onClick={() => onSelect(room)}
    className="flex gap-3 p-3 border border-gray-200 rounded-xl bg-white hover:bg-blue-50 transition transform hover:scale-[1.02] hover:shadow-lg duration-200 cursor-pointer"
  >
    <img
      src={room.image}
      alt={room.name}
      className="w-20 h-20 rounded-lg object-cover shadow-sm"
    />
    <div className="flex-1">
      <div className="font-semibold text-gray-900 text-sm">{room.name}</div>
      <div className="text-xs text-gray-600 mt-1">{room.description}</div>
      {showPrice && (
        <div className="text-blue-600 font-bold text-sm mt-2">
          ${room.price}/night
        </div>
      )}
    </div>
  </div>
);

const ChatBox = () => {
  const navigate = useNavigate();
  const { bookRoom, confirmBookingPayment, rooms: allRooms } = useRoomContext();
  const { isAuthenticated, user } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState("idle"); // idle | filter | book | payment | chat_after_booking
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [showQRPayment, setShowQRPayment] = useState(false);

  const messagesEndRef = useRef(null);

  const [filterForm, setFilterForm] = useState({
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    adults: 1,
    kids: 0,
  });

  const [bookingForm, setBookingForm] = useState({
    roomName: "",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    adults: 1,
    kids: 0,
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const [adults, setAdults] = useState("1 Adult");
  const [kids, setKids] = useState("0 Kid");
  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const handleCheck = () => {};

  const candidateRooms = useMemo(() => {
    if (!bookingForm.roomName.trim()) return [];
    const keyword = bookingForm.roomName.toLowerCase();
    return allRooms.filter((r) => r.name.toLowerCase().includes(keyword));
  }, [bookingForm.roomName, allRooms]);

  const getRandomResponse = (type) => {
    const responses = AI_RESPONSES[type] || [];
    return responses[Math.floor(Math.random() * responses.length)] || "";
  };

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => {
        pushAI(getRandomResponse("greetings"));
      }, 500);
    }
  }, [open]);

  const pushAI = (text, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text,
          timestamp: getTimestamp(),
        },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const pushUser = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
        timestamp: getTimestamp(),
      },
    ]);
  };

  const onQuick = (type) => {
    if (type === "filter") {
      pushUser("Find suitable rooms");
      setStage("filter");
      pushAI(
        "Great! 🎯 Please select check-in date, check-out date, and number of guests. I'll find the best rooms for you."
      );
    } else if (type === "book") {
      pushUser("Book now");
      setStage("book");
      pushAI(
        "Ready! 📋 Please enter a room type or keyword (e.g., Deluxe, Family, Sea View), then fill in your details."
      );
    } else if (type === "amenities") {
      pushUser("Ask about amenities");
      pushAI(
        `${getRandomResponse(
          "amenities"
        )} ✨\n\nOther features:\n🎵 Karaoke, 📺 Movie Room, 🌮 24h Food Court`
      );
    } else if (type === "contact") {
      pushUser("Contact support");
      pushAI(
        "📞 Hotline: 1-800-HOTEL\n📧 Email: support@hotel.com\n💬 24/7 Live chat support\n\nOr leave your phone number and we'll call back!"
      );
    } else if (type === "promo") {
      pushUser("Special offers");
      pushAI(
        "🎉 Today's Promotions:\n• 15% off for 3+ nights\n• Free room upgrade (available)\n• Breakfast voucher for families\n\nBook now to not miss out!"
      );
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");
    const t = text.toLowerCase();

    if (t.includes("book") || t.includes("booking")) {
      setStage("book");
      pushAI(
        "Perfect! 🛏️ What type of room would you like to book? Enter the room name or keyword, then provide your details."
      );
    } else if (
      t.includes("find") ||
      t.includes("room") ||
      t.includes("recommend") ||
      t.includes("suggest")
    ) {
      setStage("filter");
      pushAI(
        "Sure! 👍 Select your check-in and check-out dates, and number of guests. I'll recommend the best rooms for you."
      );
    } else if (
      t.includes("amenities") ||
      t.includes("facilities") ||
      t.includes("services")
    ) {
      pushAI(
        `${getRandomResponse(
          "amenities"
        )}\n\nWould you like to know more details about any specific amenity?`
      );
    } else if (t.includes("price") || t.includes("cost")) {
      pushAI(getRandomResponse("price_inquiry"));
    } else if (t.includes("contact") || t.includes("support")) {
      pushAI(
        "📞 Hotline: 1-800-HOTEL\n📧 Email: support@hotel.com\n\nHow can I help you?"
      );
    } else {
      pushAI(
        "Thank you! 😊 You can use the buttons below or ask me about:\n• Find suitable rooms\n• Book a room\n• Prices & promotions\n• Amenities & services"
      );
    }
  };

  const applyFilter = () => {
    if (filterForm.checkIn >= filterForm.checkOut) {
      pushAI(
        "⚠️ Check-out date must be after check-in date. Please try again!"
      );
      return;
    }
    setAdults(`${filterForm.adults} Adult`);
    setKids(`${filterForm.kids} Kid`);
    setCheckInDate(filterForm.checkIn);
    setCheckOutDate(filterForm.checkOut);
    try {
      handleCheck({ preventDefault: () => {} });
    } catch (_) {}
    pushAI("✅ Filter applied successfully. Redirecting to room list...");
    setTimeout(() => navigate("/"), 800);
    setTimeout(() => {
      const el = document.getElementById("rooms-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1000);
  };

  const selectRoomFromCard = (room) => {
    setBookingForm((f) => ({ ...f, roomName: room.name }));
    pushAI(
      `👍 You selected ${room.name}. Price: $${room.price}/night. Please confirm dates and enter your contact information.`
    );
    setStage("book");
  };

  const createBooking = () => {
    if (!bookingForm.roomName.trim()) {
      pushAI("❌ Please enter a room name or select a room from the list!");
      return;
    }
    if (bookingForm.checkIn >= bookingForm.checkOut) {
      pushAI("⚠️ Check-out date must be after check-in date!");
      return;
    }
    if (!bookingForm.name.trim()) {
      pushAI("❌ Please enter your name!");
      return;
    }
    if (!bookingForm.email.trim() || !bookingForm.email.includes("@")) {
      pushAI("❌ Please enter a valid email address!");
      return;
    }

    const room = candidateRooms[0];
    if (!room) {
      pushAI("❌ No matching room found. Please try a different keyword!");
      return;
    }

    const res = bookRoom({
      roomId: room.id,
      roomName: room.name,
      userId: user?.id || "guest",
      userName: bookingForm.name,
      userEmail: bookingForm.email,
      userPhone: bookingForm.phone,
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      adults: bookingForm.adults,
      kids: bookingForm.kids,
      specialRequests: bookingForm.specialRequests,
      note: "Booked via AI ChatBox",
    });

    if (res?.success) {
      setBookingConfirmed(res.booking);
      pushAI(
        `🎉 Booking Details Confirmed!\n\n` +
          `🛏️ Room: ${room.name}\n` +
          `📅 Check-in: ${bookingForm.checkIn}\n` +
          `📅 Check-out: ${bookingForm.checkOut}\n` +
          `👥 Guests: ${bookingForm.adults} adults, ${bookingForm.kids} children\n` +
          `💰 Total: $${res.booking.totalPrice}\n` +
          `✅ Confirmation Code: ${res.booking.confirmationCode}\n\n` +
          `Now proceeding to QR payment...`
      );
      setStage("payment");
      setTimeout(() => {
        setShowQRPayment(true);
      }, 1500);
    } else {
      pushAI(
        `❌ Unable to create booking: ${
          res?.error || "Please check your information and try again."
        }`
      );
    }
  };

  const handleQRPaymentConfirm = (booking) => {
    // Confirm payment in the system
    confirmBookingPayment(booking.id, {
      paymentMethod: "QR Code",
      paymentCode: `QR-${Date.now()}`,
    });

    setShowQRPayment(false);
    pushAI(
      `✅ Payment successful!\n\n` +
        `Your booking has been confirmed and saved to your account.\n` +
        `Confirmation details have been sent to ${bookingForm.email}.\n\n` +
        `Would you like to book another room or need anything else?`
    );
    setStage("idle");
    setBookingForm({
      roomName: "",
      checkIn: new Date().toISOString().split("T")[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      adults: 1,
      kids: 0,
      name: "",
      email: "",
      phone: "",
      specialRequests: "",
    });
    setBookingConfirmed(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          aria-label="Open AI Chat"
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 px-5 py-4 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-110 active:scale-95 duration-200 animate-bounce font-semibold"
        >
          <FiMessageCircle size={20} />
          <span>Chat AI</span>
        </button>
      )}

      {open && (
        <div className="w-[360px] sm:w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col animate-slide-up animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-3xl shadow-md">
            <div>
              <div className="font-bold text-lg">Booking Assistant</div>
              <div className="text-xs text-blue-100">
                24/7 Support • Fast & Friendly
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-blue-50 to-gray-50 space-y-1">
            {messages.map((m, idx) => (
              <ChatMessage key={idx} role={m.role} timestamp={m.timestamp}>
                {m.text}
              </ChatMessage>
            ))}
            {isTyping && <TypingDots />}
            <div ref={messagesEndRef} />

            {/* Suggestions when user types a room name */}
            {stage === "book" &&
              bookingForm.roomName &&
              candidateRooms.length > 0 && (
                <div className="mt-4 space-y-2 animate-fade-in">
                  <div className="text-xs font-semibold text-gray-600 px-2">
                    💡 Recommended Rooms:
                  </div>
                  {candidateRooms.slice(0, 3).map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onSelect={selectRoomFromCard}
                    />
                  ))}
                </div>
              )}

            {/* Quick actions */}
            {stage === "idle" && messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 p-2">
                <QuickReply
                  label="🔍 Find Rooms"
                  onClick={() => onQuick("filter")}
                />
                <QuickReply
                  label="📋 Book Now"
                  onClick={() => onQuick("book")}
                />
                <QuickReply
                  label="✨ Amenities"
                  onClick={() => onQuick("amenities")}
                />
                <QuickReply
                  label="🎉 Specials"
                  onClick={() => onQuick("promo")}
                />
                <QuickReply
                  label="📞 Contact"
                  onClick={() => onQuick("contact")}
                />
              </div>
            )}

            {/* Filter form */}
            {stage === "filter" && (
              <div className="p-4 bg-white border border-gray-200 rounded-2xl animate-fade-in space-y-4">
                <h3 className="font-semibold text-gray-900">Find Rooms</h3>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-gray-600 font-medium">
                    Check-in
                    <input
                      type="date"
                      value={filterForm.checkIn}
                      onChange={(e) =>
                        setFilterForm((f) => ({
                          ...f,
                          checkIn: e.target.value,
                        }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium">
                    Check-out
                    <input
                      type="date"
                      value={filterForm.checkOut}
                      onChange={(e) =>
                        setFilterForm((f) => ({
                          ...f,
                          checkOut: e.target.value,
                        }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium">
                    👥 Adults
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={filterForm.adults}
                      onChange={(e) =>
                        setFilterForm((f) => ({
                          ...f,
                          adults: Number(e.target.value),
                        }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium">
                    👶 Children
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={filterForm.kids}
                      onChange={(e) =>
                        setFilterForm((f) => ({
                          ...f,
                          kids: Number(e.target.value),
                        }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                </div>
                <button
                  onClick={applyFilter}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105 active:scale-95 duration-200"
                >
                  🔍 Find Rooms
                </button>

                {/* Featured rooms preview (top 3) */}
                <div className="space-y-2 border-t pt-4">
                  <div className="text-xs font-semibold text-gray-600">
                    🏨 Featured Rooms:
                  </div>
                  {allRooms.slice(0, 3).map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onSelect={selectRoomFromCard}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Booking form */}
            {stage === "book" && (
              <div className="p-4 bg-white border border-gray-200 rounded-2xl animate-fade-in space-y-4">
                <h3 className="font-semibold text-gray-900">
                  📋 Booking Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-gray-600 font-medium col-span-2">
                    Room Name / Search
                    <input
                      type="text"
                      value={bookingForm.roomName}
                      onChange={(e) =>
                        setBookingForm((f) => ({
                          ...f,
                          roomName: e.target.value,
                        }))
                      }
                      placeholder="e.g., Deluxe, Family, Sea View..."
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium">
                    Check-in
                    <input
                      type="date"
                      value={bookingForm.checkIn}
                      onChange={(e) =>
                        setBookingForm((f) => ({
                          ...f,
                          checkIn: e.target.value,
                        }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium">
                    Check-out
                    <input
                      type="date"
                      value={bookingForm.checkOut}
                      onChange={(e) =>
                        setBookingForm((f) => ({
                          ...f,
                          checkOut: e.target.value,
                        }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium">
                    👥 Adults
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={bookingForm.adults}
                      onChange={(e) =>
                        setBookingForm((f) => ({
                          ...f,
                          adults: Number(e.target.value),
                        }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium">
                    👶 Children
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={bookingForm.kids}
                      onChange={(e) =>
                        setBookingForm((f) => ({
                          ...f,
                          kids: Number(e.target.value),
                        }))
                      }
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium col-span-2">
                    Full Name
                    <input
                      type="text"
                      value={bookingForm.name}
                      onChange={(e) =>
                        setBookingForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="John Doe"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium col-span-2">
                    Email
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) =>
                        setBookingForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="email@example.com"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium col-span-2">
                    Phone (Optional)
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) =>
                        setBookingForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="+1 (555) 123-4567"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </label>
                  <label className="text-xs text-gray-600 font-medium col-span-2">
                    Special Requests (Optional)
                    <textarea
                      value={bookingForm.specialRequests}
                      onChange={(e) =>
                        setBookingForm((f) => ({
                          ...f,
                          specialRequests: e.target.value,
                        }))
                      }
                      placeholder="e.g., High floor, near elevator, quiet room..."
                      rows="2"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </label>
                </div>

                {bookingForm.roomName && candidateRooms.length > 0 && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                    ✅ Suggestions:{" "}
                    {candidateRooms
                      .slice(0, 2)
                      .map((r) => r.name)
                      .join(", ")}
                  </div>
                )}

                <button
                  onClick={createBooking}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition transform hover:scale-105 active:scale-95 duration-200 flex items-center justify-center gap-2"
                >
                  <FiSend size={18} />
                  Confirm Booking
                </button>
              </div>
            )}

            {/* Payment stage placeholder */}
            {stage === "payment" && (
              <div className="p-4 bg-white border border-gray-200 rounded-2xl animate-fade-in space-y-4">
                <h3 className="font-semibold text-gray-900">💳 Payment</h3>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900">
                  Payment gateway integration coming soon. Your booking details
                  have been saved.
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t bg-white rounded-b-3xl">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition transform hover:scale-105 active:scale-95 duration-200 flex items-center justify-center"
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Payment Modal */}
      {showQRPayment && bookingConfirmed && (
        <QRPaymentModal
          booking={bookingConfirmed}
          onConfirmPayment={handleQRPaymentConfirm}
          onClose={() => setShowQRPayment(false)}
        />
      )}
    </div>
  );
};

export default ChatBox;
