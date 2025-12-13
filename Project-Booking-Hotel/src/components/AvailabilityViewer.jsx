/**
 * ============================================================================
 * AVAILABILITY VIEWER - REUSABLE COMPONENT
 * ============================================================================
 * 
 * Component độc lập để hiển thị availability cho:
 * - Restaurant: Tables available tại thời điểm
 * - Spa: Slots/therapists available tại thời điểm  
 * - Rooms: Rooms available trong khoảng thời gian
 * 
 * Usage:
 * <AvailabilityViewer 
 *   type="restaurant" | "spa" | "room"
 *   dateTime={datetime}
 *   onSelect={handleSelect}
 * />
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { FaUtensils, FaSpa, FaBed, FaCheck, FaTimes, FaUsers } from 'react-icons/fa';
import { 
  fetchRestaurantSlotsByDateTime, 
  fetchSpaSlotsByDateTime,
  
} from '../services/bookingService';
import { fetchAvailableRooms } from '../services/roomService';

const AvailabilityViewer = ({ 
  type = 'restaurant', // 'restaurant' | 'spa' | 'room'
  dateTime = null, // ISO datetime string
  checkIn = null, // For rooms
  checkOut = null, // For rooms
  serviceId = null, // For spa
  therapist = null, // For spa
  guests = 1, // For restaurant/rooms
  onSelect = null, // Callback when user selects an item
  className = ''
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!dateTime && type !== 'room') return;
    if (type === 'room' && (!checkIn || !checkOut)) return;
    
    loadAvailability();
  }, [type, dateTime, checkIn, checkOut, serviceId, therapist, guests]);

  const loadAvailability = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data = [];
      
      if (type === 'restaurant') {
        const slots = await fetchRestaurantSlotsByDateTime(dateTime);
        data = slots
          .filter(slot => {
            const available = slot.status !== 'booked';
            const hasCapacity = (slot.capacity_limit - slot.capacity_used) >= guests;
            return available && hasCapacity;
          })
          .map(slot => ({
            id: slot.id,
            name: slot.restaurant_tables?.name || `Table ${slot.table_id}`,
            capacity: slot.restaurant_tables?.capacity || slot.capacity_limit,
            available: slot.capacity_limit - slot.capacity_used,
            location: slot.restaurant_tables?.location || 'N/A',
            status: slot.status,
            tableId: slot.table_id,
            slotId: slot.id,
          }));
      } else if (type === 'spa') {
        if (!serviceId) {
          setError('Service ID is required for spa availability');
          setLoading(false);
          return;
        }
        const slots = await fetchSpaSlotsByDateTime(serviceId, dateTime, therapist);
        data = slots
          .filter(slot => slot.status === 'available')
          .map(slot => ({
            id: slot.id,
            name: slot.therapist || 'Any Therapist',
            therapist: slot.therapist,
            available: slot.capacity || 1,
            status: slot.status,
            slotId: slot.id,
          }));
      } else if (type === 'room') {
        const rooms = await fetchAvailableRooms(checkIn, checkOut, guests);
        // fetchAvailableRooms already returns formatted data
        data = rooms || [];
      }
      
      setItems(data);
    } catch (err) {
      console.error(`[AvailabilityViewer] Error loading ${type} availability:`, err);
      setError(err.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    setSelectedItem(item.id);
    if (onSelect) {
      onSelect(item);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'restaurant': return <FaUtensils />;
      case 'spa': return <FaSpa />;
      case 'room': return <FaBed />;
      default: return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'restaurant': return 'Available Tables';
      case 'spa': return 'Available Slots';
      case 'room': return 'Available Rooms';
      default: return 'Availability';
    }
  };

  if (loading) {
    return (
      <div className={`p-4 bg-white border border-gray-200 rounded ${className}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin">⏳</div>
          <span>Loading availability...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <FaTimes />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded ${className}`}>
        <div className="flex items-center gap-2 text-yellow-700">
          <FaTimes />
          <span>No availability found for selected time.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          {getIcon()}
          <span>{getTitle()}</span>
          <span className="text-sm font-normal text-gray-500">({items.length} available)</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`
                p-3 border-2 rounded-lg text-left transition-all
                ${selectedItem === item.id 
                  ? 'border-accent bg-accent/10' 
                  : 'border-gray-200 hover:border-accent/50 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-gray-800">{item.name}</div>
                {selectedItem === item.id && (
                  <FaCheck className="text-accent flex-shrink-0" />
                )}
              </div>
              
              {type === 'restaurant' && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <FaUsers className="text-xs" />
                    <span>Capacity: {item.capacity} | Available: {item.available}</span>
                  </div>
                  <div className="text-xs text-gray-500">Location: {item.location}</div>
                </div>
              )}
              
              {type === 'spa' && (
                <div className="text-sm text-gray-600">
                  <div>Therapist: {item.therapist || 'Any'}</div>
                  <div className="text-xs text-gray-500">Available slots: {item.available}</div>
                </div>
              )}
              
              {type === 'room' && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Type: {item.type}</div>
                  <div className="flex items-center gap-1">
                    <FaUsers className="text-xs" />
                    <span>Capacity: {item.capacity}</span>
                  </div>
                  <div className="font-semibold text-accent">${item.price}/night</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityViewer;

