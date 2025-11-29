import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { supabase } from '../../utils/supabaseClient';

const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]); // NEW: State for Room Types
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    room_no: '',
    name: '',
    room_type_id: '',
    floor: '',
    size: '',
    type: '',
    category: '',
    price: '',
    description: '',
    status: 'available'
  });

  // Load rooms and room types from Supabase
  useEffect(() => {
    loadRoomTypes();
    loadRooms();
  }, []);

  const loadRoomTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('room_types')
        .select('id, code, name')
        .order('name', { ascending: true });
      if (error) throw error;
      setRoomTypes(data || []);
    } catch (err) {
      console.error('❌ Error loading room types:', err);
    }
  };
  
  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_no', { ascending: true });
      if (error) throw error;
      setRooms(data || []);
      console.log('✅ Rooms loaded from Supabase:', data?.length || 0);
    } catch (err) {
      console.error('❌ Error loading rooms:', err);
      // Fallback to localStorage
      const storedRooms = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
      setRooms(storedRooms);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_no: room.room_no || '',
      name: room.name || '',
      room_type_id: room.room_type_id || '',
      floor: room.floor || '',
      size: room.size || '',
      type: room.type || '',
      category: room.category || '',
      price: room.price || '',
      description: room.description || '',
      status: room.status || 'available'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        // Update existing room
        const { error } = await supabase
          .from('rooms')
          .update({
            room_no: formData.room_no,
            name: formData.name, // Thêm
            room_type_id: formData.room_type_id, // Thêm
            floor: parseInt(formData.floor) || 0,
            size: parseInt(formData.size) || 0, // Thêm
            price: parseFloat(formData.price) || 0, // Thêm
            description: formData.description, // Thêm
            status: formData.status,
            // category/type fields are cached/derived, usually not updated manually
          })
          .eq('id', editingRoom.id);
        if (error) throw error;
        console.log('✅ Room updated:', formData.room_no);
      } else {
        // Add new room
        const roomType = roomTypes.find(rt => rt.id === formData.room_type_id);
        if (!roomType) throw new Error("Invalid room type selected.");
        
        const { error } = await supabase
          .from('rooms')
          .insert([{
            room_no: formData.room_no,
            name: formData.name,
            room_type_id: formData.room_type_id,
            floor: parseInt(formData.floor) || 0,
            size: parseInt(formData.size) || 0,
            price: parseFloat(formData.price) || 0,
            description: formData.description,
            status: formData.status,
            // Cache type/category fields for frontend compatibility
            type: roomType.name,
            category: roomType.code,
          }]);
        if (error) throw error;
        console.log('✅ Room created:', formData.room_no);
      }

      await loadRooms();
      setIsModalOpen(false);
      setEditingRoom(null);
      setFormData({
        room_no: '',
        name: '',
        room_type_id: '',
        floor: '',
        size: '',
        type: '',
        category: '',
        price: '',
        description: '',
        status: 'available'
      });
    } catch (err) {
      console.error('❌ Error saving room:', err);
    }
  };

  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const { error } = await supabase
          .from('rooms')
          .delete()
          .eq('id', roomId);
        if (error) throw error;
        await loadRooms();
        console.log('✅ Room deleted');
      } catch (err) {
        console.error('❌ Error deleting room:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setFormData({
      room_no: '',
      name: '',
      room_type_id: '',
      floor: '',
      size: '',
      type: '',
      category: '',
      price: '',
      description: '',
      status: 'available'
    });
  };

  // Removed mock room types data - now using state from Supabase fetch

  const statusOptions = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
    { value: 'occupied', label: 'Occupied', color: 'bg-red-100 text-red-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'cleaning', label: 'Cleaning', color: 'bg-blue-100 text-blue-800' }
  ];

  const getStatusBadge = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${option?.color || 'bg-gray-100 text-gray-800'}`}>
        {option?.label || status}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="h2 text-primary mb-2">Rooms Management</h1>
        <p className="text-gray-600">Manage hotel rooms, pricing and availability</p>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add New Room
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent text-white">
              <tr>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Room No</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Name</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Type</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Floor</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Size</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Price</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Status</th>
                <th className="px-6 py-4 text-center font-tertiary tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No rooms added yet.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-semibold">{room.room_no}</td>
                    <td className="px-6 py-4">{room.name}</td>
                    <td className="px-6 py-4">{roomTypes.find(rt => rt.id === room.room_type_id)?.name || room.type || '-'}</td>
                    <td className="px-6 py-4">{room.floor || '-'}</td>
                    <td className="px-6 py-4">{room.size ? `${room.size}m²` : '-'}</td>
                    <td className="px-6 py-4 font-semibold">${parseFloat(room.price).toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4">{getStatusBadge(room.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-2 text-accent hover:bg-accent/10 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="h3 text-primary">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.room_no}
                    onChange={(e) => setFormData({ ...formData, room_no: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="e.g., STD-01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Room Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="e.g., Standard Room"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Room Type *</label>
                  <select
                    required
                    value={formData.room_type_id}
                    onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.code} - {rt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Floor</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Size (m²)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Price (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Room description..."
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2"
                >
                  <FaCheck /> {editingRoom ? 'Update' : 'Add New'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsManagement;
