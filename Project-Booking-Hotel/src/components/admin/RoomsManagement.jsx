import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { fetchRoomTypes } from '../../services/roomService';
import { fetchRoomsForAdmin, createRoomAdmin, updateRoomAdmin, deleteRoomAdmin } from '../../services/adminService';

const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    room_no: '',
    name: '',
    room_type_id: '',
    floor: '',
    size: '',
    price: '',
    description: '',
    status: 'available'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [roomsData, roomTypesData] = await Promise.all([
        fetchRoomsForAdmin(),
        fetchRoomTypes()
      ]);
      setRooms(roomsData);
      setRoomTypes(roomTypesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load rooms and room types');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.room_no.trim()) errors.room_no = 'Room number is required';
    if (!formData.name.trim()) errors.name = 'Room name is required';
    if (!formData.room_type_id) errors.room_type_id = 'Room type is required';
    if (!formData.price || parseFloat(formData.price) < 0) errors.price = 'Valid price is required';
    if (formData.floor && isNaN(parseInt(formData.floor))) errors.floor = 'Floor must be a number';
    if (formData.size && isNaN(parseInt(formData.size))) errors.size = 'Size must be a number';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_no: room.room_no || '',
      name: room.name || '',
      room_type_id: room.room_type_id || '',
      floor: room.floor || '',
      size: room.size || '',
      price: room.price || '',
      description: room.description || '',
      status: room.status || 'available'
    });
    setIsModalOpen(true);
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);
    try {
      const roomPayload = {
        room_no: formData.room_no.trim(),
        name: formData.name.trim(),
        room_type_id: formData.room_type_id,
        floor: formData.floor ? parseInt(formData.floor) : null,
        size: formData.size ? parseInt(formData.size) : null,
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        status: formData.status,
      };

      if (editingRoom) {
        await updateRoomAdmin(editingRoom.id, roomPayload);
        setSuccess(`Room ${formData.room_no} updated successfully`);
      } else {
        await createRoomAdmin(roomPayload);
        setSuccess(`Room ${formData.room_no} created successfully`);
      }

      await loadData();
      closeModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving room:', err);
      setError(err.message || 'Failed to save room');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (roomId, roomNo) => {
    if (!window.confirm(`Are you sure you want to delete room ${roomNo}?`)) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await deleteRoomAdmin(roomId);
      setSuccess(`Room ${roomNo} deleted successfully`);
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting room:', err);
      setError(err.message || 'Failed to delete room');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setFormData({
      room_no: '',
      name: '',
      room_type_id: '',
      floor: '',
      size: '',
      price: '',
      description: '',
      status: 'available'
    });
    setValidationErrors({});
  };

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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✅ {success}
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
          disabled={isLoading}
        >
          <FaPlus /> Add New Room
        </button>
      </div>

      {isLoading && !error ? (
        <div className="text-center py-12 text-gray-500">Loading rooms...</div>
      ) : (
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
                      <td className="px-6 py-4">{room.room_types?.name || '-'}</td>
                      <td className="px-6 py-4">{room.floor || '-'}</td>
                      <td className="px-6 py-4">{room.size ? `${room.size}m²` : '-'}</td>
                      <td className="px-6 py-4 font-semibold">${parseFloat(room.price).toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4">{getStatusBadge(room.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(room)}
                            className="p-2 text-accent hover:bg-accent/10 rounded transition-colors disabled:opacity-50"
                            title="Edit"
                            disabled={isSaving}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(room.id, room.room_no)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete"
                            disabled={isSaving}
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
      )}

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
                  <label className="block text-sm font-semibold mb-2 text-primary">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.room_no}
                    onChange={(e) => setFormData({ ...formData, room_no: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      validationErrors.room_no ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., STD-01"
                    disabled={isSaving}
                  />
                  {validationErrors.room_no && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.room_no}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Standard Room"
                    disabled={isSaving}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">
                    Room Type *
                  </label>
                  <select
                    required
                    value={formData.room_type_id}
                    onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      validationErrors.room_type_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.code} - {rt.name}</option>
                    ))}
                  </select>
                  {validationErrors.room_type_id && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.room_type_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    disabled={isSaving}
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      validationErrors.floor ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSaving}
                  />
                  {validationErrors.floor && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.floor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Size (m²)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      validationErrors.size ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSaving}
                  />
                  {validationErrors.size && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.size}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      validationErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSaving}
                  />
                  {validationErrors.price && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>
                  )}
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
                  disabled={isSaving}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaCheck /> {isSaving ? 'Saving...' : (editingRoom ? 'Update' : 'Add New')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaTimes /> Cancel
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