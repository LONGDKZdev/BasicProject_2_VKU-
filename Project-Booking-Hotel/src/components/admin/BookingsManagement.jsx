import { useState, useEffect } from 'react';
import { supabase } from '../../db/supabaseClient';
import Toast from '../Toast';
import { FaBookmark, FaEdit, FaTimesCircle, FaTimes, FaInfoCircle } from 'react-icons/fa';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          id,
          confirmation_code,
          user_id,
          room_id,
          status,
          check_in_date,
          check_out_date,
          total_amount,
          payment_status,
          created_at,
          profiles(full_name, email, phone),
          rooms(room_number, room_types(name))
        `)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setBookings(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
      setToast({ type: 'error', message: 'Lỗi tải danh sách đặt phòng' });
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.confirmation_code?.includes(searchTerm.toUpperCase()) ||
      booking.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Change booking status
  const handleChangeStatus = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setShowModal(true);
  };

  // Submit status change
  const handleSubmitStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      const { error: err } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', selectedBooking.id);

      if (err) throw err;

      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: newStatus } : b
      ));
      setToast({ type: 'success', message: 'Cập nhật trạng thái thành công' });
      setShowModal(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setToast({ type: 'error', message: 'Lỗi cập nhật trạng thái' });
    }
  };

  // Cancel booking
  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) return;

    try {
      const { error: err } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (err) throw err;

      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'cancelled' } : b
      ));
      setToast({ type: 'success', message: 'Đặt phòng đã bị hủy' });
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setToast({ type: 'error', message: 'Lỗi hủy đặt phòng' });
    }
  };

  // Refund booking (set payment_status to refunded)
  const handleRefund = async (booking) => {
    if (!window.confirm('Bạn có chắc chắn muốn hoàn tiền cho khách hàng này?')) return;

    try {
      const { error: err } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          payment_status: 'refunded' 
        })
        .eq('id', booking.id);

      if (err) throw err;

      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'cancelled', payment_status: 'refunded' } : b
      ));
      setToast({ type: 'success', message: 'Hoàn tiền thành công' });
    } catch (err) {
      console.error('Error refunding booking:', err);
      setToast({ type: 'error', message: 'Lỗi hoàn tiền' });
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      checked_in: 'bg-green-100 text-green-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (status) => {
    const classes = {
      pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-blue-100 text-blue-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
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
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaBookmark /> Quản lý Đặt phòng
        </h2>
        <p className="text-amber-100 mt-1">Quản lý và xử lý đơn đặt phòng</p>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Mã, tên khách, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="checked_in">Đã nhận phòng</option>
            <option value="checked_out">Đã trả phòng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-sm text-gray-600">
            <strong>{filteredBookings.length}</strong> đặt phòng
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Mã
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Khách
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Thanh toán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-amber-600">
                  {booking.confirmation_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">{booking.profiles?.full_name}</p>
                    <p className="text-xs text-gray-500">{booking.profiles?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {booking.rooms?.room_number} ({booking.rooms?.room_types?.name})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  <div>
                    <p>{formatDate(booking.check_in_date)}</p>
                    <p className="text-gray-500">{formatDate(booking.check_out_date)}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-amber-600">
                  ${booking.total_amount?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                    {booking.status === 'pending' ? 'Chờ xác nhận'
                     : booking.status === 'confirmed' ? 'Đã xác nhận'
                     : booking.status === 'checked_in' ? 'Đã nhận phòng'
                     : booking.status === 'checked_out' ? 'Đã trả phòng'
                     : booking.status === 'cancelled' ? 'Đã hủy'
                     : booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(booking.payment_status)}`}>
                    {booking.payment_status === 'pending' ? 'Chưa thanh toán'
                     : booking.payment_status === 'paid' ? 'Đã thanh toán'
                     : booking.payment_status === 'refunded' ? 'Đã hoàn tiền'
                     : booking.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1">
                  <button
                    onClick={() => handleChangeStatus(booking)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                    title="Thay đổi trạng thái"
                  >
                    <FaEdit className="inline" />
                  </button>
                  {booking.payment_status !== 'refunded' && (
                    <button
                      onClick={() => handleRefund(booking)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs"
                      title="Hoàn tiền"
                    >
                      💰
                    </button>
                  )}
                  <button
                    onClick={() => handleCancelBooking(booking)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                    title="Hủy"
                  >
                    <FaTimesCircle className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaBookmark className="text-4xl mx-auto mb-2 opacity-30" />
          <p>Không tìm thấy đặt phòng nào</p>
        </div>
      )}

      {/* Modal - Change Status */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Thay đổi trạng thái</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <FaInfoCircle />
                {selectedBooking.confirmation_code} - {selectedBooking.profiles?.full_name}
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái mới
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="checked_in">Đã nhận phòng</option>
                <option value="checked_out">Đã trả phòng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitStatusChange}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;