import { useState, useEffect } from 'react';
import {
  FaEdit,
  FaTrash,
  FaUser,
  FaEnvelope,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaBriefcase,
  FaExclamationCircle,
} from 'react-icons/fa';
import { fetchAllUsers, updateUser, deleteUser, fetchUserById } from '../../services/adminService';

/**
 * ============================================================================
 * USERS MANAGEMENT - REFACTORED
 * ============================================================================
 * 
 * Displays all user profiles from the database and allows admin to:
 * - View user details
 * - Edit user information (full_name, role)
 * - Delete user accounts
 * 
 * Uses adminService for all data operations
 * ============================================================================
 */

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
  });

  /**
   * Load all users from service
   */
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
      console.log(`✅ Loaded ${data.length} users`);
    } catch (err) {
      console.error('❌ Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Open edit modal for user
   */
  const handleEdit = async (user) => {
    if (!user.id) {
      setError('Cannot edit user without a valid ID.');
      return;
    }
    
    // Fetch full user data
    const fullUser = await fetchUserById(user.id);
    if (!fullUser) {
      setError('Failed to load user details');
      return;
    }

    setEditingUser(fullUser);
    setFormData({
      full_name: fullUser.full_name || '',
      role: fullUser.role || 'user',
    });
    setIsModalOpen(true);
  };

  /**
   * Handle form input change
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Submit user update
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser?.id) return;

    setIsUpdating(true);
    try {
      const updated = await updateUser(editingUser.id, {
        full_name: formData.full_name,
        role: formData.role,
      });

      if (updated) {
        // Update local state
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, full_name: formData.full_name, role: formData.role }
              : u
          )
        );
        closeModal();
        console.log('✅ User updated successfully');
      } else {
        setError('Failed to update user');
      }
    } catch (err) {
      console.error('❌ Error updating user:', err);
      setError('Error updating user. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle user deletion
   */
  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this user account? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsUpdating(true);
    try {
      const success = await deleteUser(userId);
      if (success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        console.log('✅ User deleted successfully');
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      setError('Error deleting user. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Close modal and reset form
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ full_name: '', role: '' });
  };

  /**
   * Get role badge with color
   */
  const getRoleBadge = (role) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    if (role === 'admin') {
      colorClass = 'bg-red-100 text-red-800';
    } else if (role === 'user') {
      colorClass = 'bg-blue-100 text-blue-800';
    }

    return (
      <span className={`px-3 py-1 ${colorClass} rounded-full text-xs font-semibold uppercase tracking-wider`}>
        {role?.toUpperCase() || 'USER'}
      </span>
    );
  };

  // ========== RENDER ==========

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="h2 text-primary mb-2">Users Management</h1>
        <p className="text-gray-600">
          View, edit, and manage all user accounts
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <FaExclamationCircle size={20} />
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-accent text-3xl" />
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      ) : (
        /* Users Table */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-tertiary tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left font-tertiary tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left font-tertiary tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left font-tertiary tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left font-tertiary tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-center font-tertiary tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                            <FaUser className="text-accent" size={14} />
                          </div>
                          <span className="font-medium">{user.full_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" size={14} />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.phone || '-'}</td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            disabled={isUpdating}
                            className="p-2 text-accent hover:bg-accent/10 rounded transition-colors disabled:opacity-50"
                            title="Edit User"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isUpdating}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete User"
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

      {/* Edit Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="h3 text-primary">Edit User</h2>
              <p className="text-sm text-gray-600 mt-1">
                Update user information
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter full name"
                  disabled={isUpdating}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isUpdating}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Read-Only Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">
                  Email (Read-Only)
                </label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isUpdating}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
