import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUser, FaEnvelope, FaSpinner, FaCheck, FaTimes, FaBriefcase, FaExclamationCircle } from 'react-icons/fa';
import { AdminTable } from '../../features/admin';
import { fetchAllUsers, fetchUserById, updateUser, deleteUser } from '../../services/adminService';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    role: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const usersData = await fetchAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (user) => {
    if (!user.id) {
      setError('Cannot edit user without a valid ID.');
      return;
    }
    
    // Fetch full user data to ensure we have all fields
    try {
      const fullUser = await fetchUserById(user.id);
      if (!fullUser) {
        setError('Failed to load user details');
        return;
      }
      
      setEditingUser(fullUser);
      setFormData({
        full_name: fullUser.full_name || '',
        role: fullUser.role || 'user'
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const valuesToUpdate = {
        full_name: formData.full_name.trim(),
        role: formData.role
      };
      
      const updated = await updateUser(editingUser.id, valuesToUpdate);
      if (updated) {
        setSuccess(`User ${formData.full_name} updated successfully`);
        await loadData();
        closeModal();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update user');
      }
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      setIsUpdating(true);
      setError(null);
      try {
        const success = await deleteUser(userId);
        if (success) {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setSuccess('User deleted successfully');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError('Failed to delete user');
        }
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError(err.message || 'Failed to delete user');
      } finally {
        setIsUpdating(false);
      }
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ full_name: '', role: '' });
  };
  
  const getRoleBadge = (role) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    if (role === 'admin') {
      colorClass = 'bg-red-100 text-red-800';
    } else if (role === 'user') {
      colorClass = 'bg-blue-100 text-blue-800';
    }

    return (
      <span className={`px-2 py-1 ${colorClass} rounded-full text-xs font-semibold`}>
        {role?.toUpperCase() || 'N/A'}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="h2 text-primary mb-2">Users Management</h1>
        <p className="text-gray-600">Manage user accounts - View and edit user information</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
          <FaExclamationCircle size={20} />
          <p className="flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✅ {success}
        </div>
      )}
      
      {/* Stats Cards - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Total Profiles</h3>
            <FaUser className="text-3xl text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">{users.length}</p>
          <p className="text-sm text-gray-500 mt-2">Total user profiles</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Admins</h3>
            <FaBriefcase className="text-3xl text-red-500" />
          </div>
          <p className="text-3xl font-bold text-accent">
            {users.filter(u => u.role === 'admin').length}
          </p>
          <p className="text-sm text-gray-500 mt-2">Users with admin role</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Standard Users</h3>
            <FaUser className="text-3xl text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-accent">
            {users.filter(u => u.role === 'user').length}
          </p>
          <p className="text-sm text-gray-500 mt-2">Standard authenticated users</p>
        </div>
      </div>

      {/* Loading State or Users Table */}
      {isLoading && users.length === 0 ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow-md">
          <FaSpinner className="animate-spin text-accent text-3xl" />
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent text-white">
              <tr>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Name</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Email</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Role</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Created At</th>
                <th className="px-6 py-4 text-center font-tertiary tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <FaSpinner className="animate-spin text-accent text-2xl" />
                      <span className="text-gray-600">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No users found
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
                        {user.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.phone || '-'}</td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-accent hover:bg-accent/10 rounded transition-colors disabled:opacity-50"
                          title="Edit"
                          disabled={isUpdating}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                          disabled={isUpdating}
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
            <div className="p-6 border-b border-gray-200">
              <h2 className="h3 text-primary">Edit User Profile</h2>
              <p className="text-sm text-gray-600 mt-1">
                Update user information
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="User full name"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Role *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaBriefcase className="text-gray-400" />
                  </div>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent appearance-none"
                    disabled={isUpdating}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isUpdating}
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Save Changes
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

