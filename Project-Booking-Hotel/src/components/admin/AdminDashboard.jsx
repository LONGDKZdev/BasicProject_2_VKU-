import { useState, useEffect } from 'react';
import { FaBox, FaBookmark, FaUsers, FaDollarSign, FaChartBar } from 'react-icons/fa';
import { supabase } from '../../utils/supabaseClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch total rooms
        const { count: roomsCount } = await supabase
          .from('rooms')
          .select('id', { count: 'exact' });

        // Fetch total bookings
        const { count: bookingsCount } = await supabase
          .from('bookings')
          .select('id', { count: 'exact' });

        // Fetch total users
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });

        // Fetch total revenue
        const { data: revenueData } = await supabase
          .from('bookings')
          .select('total_amount')
          .eq('status', 'completed');

        const totalRevenue = revenueData
          ? revenueData.reduce((sum, b) => sum + (b.total_amount || 0), 0)
          : 0;

        // Fetch recent bookings
        const { data: recentBookingsData } = await supabase
          .from('bookings')
          .select(`
            id,
            confirmation_code,
            check_in,
            check_out,
            total_amount,
            status,
            profiles:user_id (full_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalRooms: roomsCount || 0,
          totalBookings: bookingsCount || 0,
          totalUsers: usersCount || 0,
          totalRevenue: totalRevenue.toFixed(2),
          recentBookings: recentBookingsData || [],
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Rooms */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalRooms}</p>
            </div>
            <FaBox className="text-3xl text-blue-500 opacity-20" />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalBookings}</p>
            </div>
            <FaBookmark className="text-3xl text-green-500 opacity-20" />
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
            </div>
            <FaUsers className="text-3xl text-purple-500 opacity-20" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">${stats.totalRevenue}</p>
            </div>
            <FaDollarSign className="text-3xl text-amber-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <FaChartBar className="text-amber-600" />
          <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Confirmation Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Guest Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Check-in</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Check-out</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                stats.recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-800">{booking.confirmation_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{booking.profiles?.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(booking.check_in).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(booking.check_out).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-amber-600">
                      ${booking.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          <p>Error loading dashboard: {error}</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;