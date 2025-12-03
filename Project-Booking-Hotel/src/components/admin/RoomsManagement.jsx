import { useState, useEffect } from 'react';
import { supabase } from '../../db/supabaseClient';
import Toast from '../Toast';
import { FaBox, FaEdit, FaTrash, FaPlus, FaTimes, FaImage } from 'react-icons/fa';

const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [roomTypes, setRoomTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('edit');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: '',
    floor: '',
    size_sqm: '',
    capacity: '',
    nightly_rate: '',
    room_type_id: '',
    status: 'available',
    description: '',
  });

  // Fetch rooms and room types
  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const { data, error: err } = await supabase
        .from('room_types')
        .select('id, code, name')
        .eq('is_active', true)
        .order('name');

      if (err) throw err;
      setRoomTypes(data || []);
    } catch (err) {
      console.error('Error fetching room types:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('rooms')
        .select('*, room_types(id, code, name)')
        .order('room_number');

      if (err) throw err;
      setRooms(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.message);
      setToast({ type: 'error', message: 'Lỗi tải danh sách phòng' });
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number?.includes(searchTerm) || 
                         room.room_types?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || room.room_type_id === filterType;
    return matchesSearch && matchesType;
  });

  // Open edit modal
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setModalType('edit');
    setFormData({
      room_number: room.room_number,
      floor: room.floor,
      size_sqm: room.size_sqm,
      capacity: room.capacity,
      nightly_rate: room.nightly_rate,
      room_type_id: room.room_type_id,
      status: room.status || 'available',
      description: room.description || '',
    });
    setShowModal(true);
  };

  // Open new room modal
  const handleNewRoom = () => {
    setSelectedRoom(null);
    setModalType('new');
    setFormData({
      room_number: '',
      floor: '',
      size_sqm: '',
      capacity: '',
      nightly_rate: '',
      room_type_id: '',
      status: 'available',
      description: '',
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmitModal = async () => {
    if (!formData.room_number || !formData.room_type_id) {
      setToast({ type: 'error', message: 'Vui lòng điền các trường bắt buộc' });
      return;
    }

    try {
      if (modalType === 'new') {
        // Create new room
        const { error: err } = await supabase
          .from('rooms')
          .insert([{
            ...formData,
            size_sqm: parseFloat(formData.size_sqm),
            capacity: parseInt(formData.capacity),
            nightly_rate: parseFloat(formData.nightly_rate),
            floor: parseInt(formData.floor),
          }]);

        if (err) throw err;
        setToast({ type: 'success', message: 'Phòng mới tạo thành công' });
      } else {
        // Update existing room
        const { error: err } = await supabase
          .from('rooms')
          .update({
            ...formData,
            size_sqm: parseFloat(formData.size_sqm),
            capacity: parseInt(formData.capacity),
            nightly_rate: parseFloat(formData.nightly_rate),
            floor: parseInt(formData.floor),
          })
          .eq('id', selectedRoom.id);

        if (err) throw err;
        setToast({ type: 'success', message: 'Cập nhật phòng thành công' });
      }

      setShowModal(false);
      fetchRooms();
    } catch (err) {
      console.error('Error submitting room:', err);
      setToast({ type: 'error', message: 'Lỗi lưu phòng' });
    }
  };

  // Delete room
  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ${room.room_number}?`)) return;

    try {
      const { error: err } = await supabase
        .from('rooms')
        .delete()
        .eq('id', room.id);

      if (err) throw err;
      setRooms(rooms.filter(r => r.id !== room.id));
      setToast({ type: 'success', message: 'Phòng đã bị xóa' });
    } catch (err) {
      console.error('Error deleting room:', err);
      setToast({ type: 'error', message: 'Lỗi xóa phòng' });
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-orange-100 text-orange-800',
      unavailable: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaBox /> Quản lý Phòng
          </h2>
          <p className="text-amber-100 mt-1">Quản lý danh sách phòng và giá cả</p>
        </div>
        <button
          onClick={handleNewRoom}
          className="bg-white text-amber-600 px-4 py-2 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center gap-2"
        >
          <FaPlus /> Thêm phòng
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm phòng</label>
          <input
            type="text"
            placeholder="Số phòng hoặc loại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Tất cả</option>
            {roomTypes.map(rt => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-sm text-gray-600">
            <strong>{filteredRooms.length}</strong> phòng
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tầng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Diện tích
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Giá/đêm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {room.room_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {room.room_types?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {room.floor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {room.size_sqm} m²
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-amber-600">
                  ${room.nightly_rate?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(room.status)}`}>
                    {room.status === 'available' ? 'Có sẵn' 
                     : room.status === 'occupied' ? 'Đã đặt'
                     : room.status === 'maintenance' ? 'Bảo trì'
                     : 'Không có'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleEditRoom(room)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center gap-1"
                    title="Chỉnh sửa"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors inline-flex items-center gap-1"
                    title="Xóa"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaBox className="text-4xl mx-auto mb-2 opacity-30" />
          <p>Không tìm thấy phòng nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">
                {modalType === 'new' ? 'Thêm phòng mới' : 'Chỉnh sửa phòng'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại phòng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.room_type_id}
                    onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Chọn loại phòng</option>
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tầng</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
                  <input
                    type="number"
                    value={formData.size_sqm}
                    onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá/đêm ($)</label>
                  <input
                    type="number"
                    value={formData.nightly_rate}
                    onChange={(e) => setFormData({ ...formData, nightly_rate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="available">Có sẵn</option>
                  <option value="occupied">Đã đặt</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="unavailable">Không có</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 h-20"
                  placeholder="Mô tả chi tiết..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitModal}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                {modalType === 'new' ? 'Tạo phòng' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsManagement;