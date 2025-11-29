import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUser, FaEnvelope, FaLock, FaCheck, FaTimes } from 'react-icons/fa';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  // Load users from localStorage
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('hotel_users') || '[]');
    setUsers(storedUsers);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const storedUsers = JSON.parse(localStorage.getItem('hotel_users') || '[]');
    const updatedUsers = storedUsers.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: formData.name,
          email: formData.email
          // Password is not changed - it remains encrypted/hashed
        };
      }
      return u;
    });

    localStorage.setItem('hotel_users', JSON.stringify(updatedUsers));
    loadUsers();
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '' });
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      const storedUsers = JSON.parse(localStorage.getItem('hotel_users') || '[]');
      const filteredUsers = storedUsers.filter(u => u.id !== userId);
      localStorage.setItem('hotel_users', JSON.stringify(filteredUsers));
      loadUsers();
    }
  };

  const maskPassword = () => {
    return '••••••••';
  };

  const getProviderBadge = (provider) => {
    if (!provider) return null;
    return (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
        {provider.charAt(0).toUpperCase() + provider.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="h2 text-primary mb-2">Users Management</h1>
        <p className="text-gray-600">Manage user accounts - View and edit user information</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Total Users</h3>
            <FaUser className="text-3xl text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">{users.length}</p>
          <p className="text-sm text-gray-500 mt-2">Registered users</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Email/Password</h3>
            <FaEnvelope className="text-3xl text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">
            {users.filter(u => !u.provider).length}
          </p>
          <p className="text-sm text-gray-500 mt-2">Traditional accounts</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">OAuth Users</h3>
            <FaUser className="text-3xl text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">
            {users.filter(u => u.provider).length}
          </p>
          <p className="text-sm text-gray-500 mt-2">Social login users</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent text-white">
              <tr>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">ID</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Name</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Email</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Password</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Login Method</th>
                <th className="px-6 py-4 text-left font-tertiary tracking-wider">Created At</th>
                <th className="px-6 py-4 text-center font-tertiary tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No users registered yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">{user.id}</td>
                    <td className="px-6 py-4 font-semibold">{user.name || '-'}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.provider ? (
                        <span className="text-gray-400 italic">N/A (OAuth)</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FaLock className="text-gray-400" />
                          <span className="font-mono text-sm text-gray-600">{maskPassword()}</span>
                          <span className="text-xs text-gray-400">(Encrypted)</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getProviderBadge(user.provider) || (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                          Email
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
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
                          className="p-2 text-accent hover:bg-accent/10 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
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

      {/* Edit Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="h3 text-primary">Edit User Account</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="User name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Email *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={maskPassword()}
                    disabled
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password is encrypted and cannot be viewed or edited for security reasons.
                </p>
              </div>

              {editingUser.provider && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaUser className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">OAuth User</p>
                      <p className="text-xs text-blue-700 mt-1">
                        This user registered via {editingUser.provider}. Password management is not available.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2"
                >
                  <FaCheck /> Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '' });
                  }}
                  className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2"
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

export default UsersManagement;

