import { useState } from 'react';
import { FaChartLine, FaChartBar, FaDollarSign, FaBed } from 'react-icons/fa';

const ReportsManagement = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportType, setReportType] = useState('revenue');

  // Mock data - will be replaced with real data from Supabase
  const revenueData = {
    daily: [],
    monthly: [],
    total: 0
  };

  const occupancyData = {
    rate: 0,
    occupied: 0,
    total: 0
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
          <p className="text-3xl font-bold text-accent">${revenueData.total.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">In selected time period</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Occupancy Rate</h3>
            <FaBed className="text-3xl text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">{occupancyData.rate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-2">
            {occupancyData.occupied} / {occupancyData.total} rooms
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Total Bookings</h3>
            <FaChartBar className="text-3xl text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">0</p>
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

        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <FaChartLine className="text-5xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Chart will be displayed here</p>
            <p className="text-sm text-gray-400">
              Use Recharts or Chart.js to integrate charts
            </p>
          </div>
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
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    No data available. Please select a time period and load report.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
