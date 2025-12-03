import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaChild, FaSearch } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Toast from './Toast';

const BookForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    checkIn: new Date(),
    checkOut: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    adults: 2,
    children: 0,
    roomType: 'all',
  });

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'roomType' ? value : parseInt(value),
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Validation
    if (formData.checkOut <= formData.checkIn) {
      setToast({
        message: 'Check-out date must be after check-in date',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (formData.adults < 1) {
      setToast({
        message: 'Please select at least 1 adult',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    // Build query string
    const params = new URLSearchParams({
      checkIn: formData.checkIn.toISOString().split('T')[0],
      checkOut: formData.checkOut.toISOString().split('T')[0],
      adults: formData.adults,
      children: formData.children,
      ...(formData.roomType !== 'all' && { roomType: formData.roomType }),
    });

    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
      <Toast message={toast?.message} type={toast?.type} duration={toast?.duration} />

      <form onSubmit={handleSearch} className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:items-end">
        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-4 text-gray-400 pointer-events-none" />
            <DatePicker
              selected={formData.checkIn}
              onChange={(date) => handleDateChange('checkIn', date)}
              minDate={new Date()}
              dateFormat="MM/dd/yyyy"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-4 text-gray-400 pointer-events-none" />
            <DatePicker
              selected={formData.checkOut}
              onChange={(date) => handleDateChange('checkOut', date)}
              minDate={formData.checkIn}
              dateFormat="MM/dd/yyyy"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>
        </div>

        {/* Adults */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Adults</label>
          <div className="relative">
            <FaUsers className="absolute left-3 top-4 text-gray-400 pointer-events-none" />
            <select
              name="adults"
              value={formData.adults}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition appearance-none bg-white"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Adult' : 'Adults'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Children */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Children</label>
          <div className="relative">
            <FaChild className="absolute left-3 top-4 text-gray-400 pointer-events-none" />
            <select
              name="children"
              value={formData.children}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition appearance-none bg-white"
            >
              {[0, 1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Child' : 'Children'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 lg:whitespace-nowrap"
        >
          <FaSearch /> Search Rooms
        </button>
      </form>
    </div>
  );
};

export default BookForm;