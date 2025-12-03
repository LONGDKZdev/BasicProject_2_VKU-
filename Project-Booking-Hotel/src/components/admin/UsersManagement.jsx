import { useState, useEffect } from 'react';
import { supabase } from '../../db/supabaseClient';
import Toast from '../Toast';
import { FaEdit, FaTrash, FaUser, FaShieldAlt, FaTimes } from 'react-icons/fa';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({ status: 'active', role: 'user' });

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, country, role, status, created_at')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setUsers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setToast({ type: 'error', message: 'Lỗi tải danh sách người dùng' });
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Update user status
  const handleChangeStatus = (user) => {
    setSelectedUser(user);
    setModalType('status');
    setFormData({ status: user.status, role: user.role });
    setShowModal(true);
  };

  // Update user role
  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setModalType('role');
    setFormData({ role: user.role, status: user.status });
    setShowModal(true);
  };

  // Submit changes
  const handleSubmitModal = async () => {
    if (!selectedUser) return;

    try {
      const updates = {};
      if (modalType === 'status') {
        updates.status = formData.status;
      } else if (modalType === 'role') {
        updates.role = formData.role;
      }

      const { error: err } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', selectedUser.id);

      if (err) throw err;

      // Update local state
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...updates } : u));
      setToast({ type: 'success', message: 'Cập nhật người dùng thành công' });
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setToast({ type: 'error', message: 'Lỗi cập nhật người dùng' });
    }
  };

  // Delete user (soft delete by setting status to inactive)
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn vô hiệu hóa ${user.full_name}?`)) return;

    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', user.id);

      if (err) throw err;

      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'inactive' } : u));
      setToast({ type: 'success', message: 'Người dùng đã bị vô hiệu hóa' });
    } catch (err) {
      console.error('Error deleting user:', err);
      setToast({ type: 'error', message: 'Lỗi vô hiệu hóa người dùng' });
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role) => {
    const classes = {
      user: 'bg-blue-100 text-blue-800',
      staff: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-purple-100 text-purple-800',
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
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
          <FaUser /> Quản lý Người dùng
        </h2>
        <p className="text-amber-100 mt-1">Quản lý tài khoản và quyền truy cập</p>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tên hoặc email..."
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
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="suspended">Bị khóa</option>
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-sm text-gray-600">
            <strong>{filteredUsers.length}</strong> người dùng
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Quyền
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
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-800">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {user.full_name || 'Không có tên'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                    {user.role === 'admin' && <FaShieldAlt className="inline mr-1" />}
                    {user.role === 'user' ? 'Người dùng' : user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                    {user.status === 'active'
                      ? 'Hoạt động'
                      : user.status === 'inactive'
                      ? 'Không hoạt động'
                      : 'Bị khóa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleChangeRole(user)}
                    className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors inline-flex items-center gap-1"
                    title="Thay đổi quyền"
                  >
                    <FaShieldAlt className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleChangeStatus(user)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center gap-1"
                    title="Thay đổi trạng thái"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors inline-flex items-center gap-1"
                    title="Vô hiệu hóa"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaUser className="text-4xl mx-auto mb-2 opacity-30" />
          <p>Không tìm thấy người dùng nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {modalType === 'status' ? 'Thay đổi trạng thái' : 'Thay đổi quyền'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {selectedUser.full_name || selectedUser.email}
              </p>

              {modalType === 'status' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="suspended">Bị khóa</option>
                  </select>
                </div>
              )}

              {modalType === 'role' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quyền
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="user">Người dùng</option>
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              )}
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
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;