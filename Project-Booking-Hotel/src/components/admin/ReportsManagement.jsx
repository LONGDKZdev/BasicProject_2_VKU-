import { useState, useEffect } from 'react';
import { FaChartLine, FaChartBar, FaDollarSign, FaBed } from 'react-icons/fa';
import { supabase } from '../../utils/supabaseClient';
import { RevenueChart, OccupancyChart } from '../charts';

const ReportsManagement = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [revenueData, setRevenueData] = useState({
    daily: [],
    monthly: [],
    total: 0
  });
  const [occupancyData, setOccupancyData] = useState({
    rate: 0,
    occupied: 0,
    total: 0
  });
  const [totalBookings, setTotalBookings] = useState(0);
  const [occupancyHistory, setOccupancyHistory] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [dateRange, reportType]);

  const loadReportData = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    
    setIsLoading(true);
    try {
      // Fetch bookings in date range
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_amount, check_in, check_out, status, created_at')
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate + 'T23:59:59');

      const { data: restaurantBookings, error: restError } = await supabase
        .from('restaurant_bookings')
        .select('total_price, created_at, status')
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate + 'T23:59:59');

      const { data: spaBookings, error: spaError } = await supabase
        .from('spa_bookings')
        .select('total_price, created_at, status')
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate + 'T23:59:59');

      if (bookingsError || restError || spaError) {
        console.error('Error fetching bookings:', bookingsError || restError || spaError);
        return;
      }

      // Calculate total revenue
      const roomRevenue = (bookings || []).reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
      const restRevenue = (restaurantBookings || []).reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
      const spaRevenue = (spaBookings || []).reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
      const totalRevenue = roomRevenue + restRevenue + spaRevenue;

      // Calculate total bookings
      const total = (bookings?.length || 0) + (restaurantBookings?.length || 0) + (spaBookings?.length || 0);

      // Calculate occupancy (for room bookings only)
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id, status');
      
      if (!roomsError && rooms) {
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
        
        setOccupancyData({
          rate: occupancyRate,
          occupied: occupiedRooms,
          total: totalRooms
        });

        // Calculate occupancy history by date
        const occupancyMap = new Map();
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        // Initialize all dates in range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          occupancyMap.set(dateStr, { date: dateStr, occupied: 0, total: totalRooms, rate: 0 });
        }

        // Calculate occupancy for each date based on bookings
        (bookings || []).forEach(booking => {
          if (booking.status === 'confirmed' || booking.status === 'checked_in') {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            
            for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().split('T')[0];
              if (occupancyMap.has(dateStr)) {
                const dayData = occupancyMap.get(dateStr);
                dayData.occupied += 1;
                dayData.rate = totalRooms > 0 ? (dayData.occupied / totalRooms) * 100 : 0;
              }
            }
          }
        });

        const history = Array.from(occupancyMap.values())
          .map(item => ({
            date: item.date,
            rate: item.rate
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setOccupancyHistory(history);
      }

      // Group revenue by date
      const dailyMap = new Map();
      [...(bookings || []), ...(restaurantBookings || []), ...(spaBookings || [])].forEach(booking => {
        const date = new Date(booking.created_at).toISOString().split('T')[0];
        const amount = parseFloat(booking.total_amount || booking.total_price || 0);
        dailyMap.set(date, (dailyMap.get(date) || 0) + amount);
      });

      const daily = Array.from(dailyMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setRevenueData({
        daily,
        monthly: [], // Can be calculated from daily if needed
        total: totalRevenue
      });

      setTotalBookings(total);
    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="h2 text-primary mb-2">Reports & Statistics</h1>
        <p className="text-gray-600">Revenue, occupancy rate and statistics charts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-primary">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="revenue">Revenue</option>
              <option value="occupancy">Occupancy Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-primary">From Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-primary">To Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Total Revenue</h3>
            <FaDollarSign className="text-3xl text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">
            {isLoading ? '...' : `$${revenueData.total.toLocaleString()}`}
          </p>
          <p className="text-sm text-gray-500 mt-2">In selected time period</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Occupancy Rate</h3>
            <FaBed className="text-3xl text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">
            {isLoading ? '...' : `${occupancyData.rate.toFixed(1)}%`}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {occupancyData.occupied} / {occupancyData.total} rooms
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Total Bookings</h3>
            <FaChartBar className="text-3xl text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">
            {isLoading ? '...' : totalBookings}
          </p>
          <p className="text-sm text-gray-500 mt-2">Number of bookings</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="h3 text-primary">
            {reportType === 'revenue' ? 'Revenue Chart' : 'Occupancy Rate Chart'}
          </h2>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          {reportType === 'revenue' ? (
            <RevenueChart data={revenueData.daily} type="line" />
          ) : (
            <OccupancyChart data={occupancyHistory} type="line" />
          )}
        </div>
      </div>

      {/* Revenue Table */}
      {reportType === 'revenue' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="h3 text-primary">Revenue Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-tertiary tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left font-tertiary tracking-wider">Revenue</th>
                  <th className="px-6 py-4 text-left font-tertiary tracking-wider">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : revenueData.daily.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                      No data available for selected time period.
                    </td>
                  </tr>
                ) : (
                  revenueData.daily.map((day, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold">${day.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4">-</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
