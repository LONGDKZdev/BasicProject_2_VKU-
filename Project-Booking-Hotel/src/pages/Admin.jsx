import { useState } from 'react';
import { FaChartBar, FaBox, FaBookmark, FaUsers, FaCog } from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import RoomsManagement from '../components/admin/RoomsManagement';
import BookingsManagement from '../components/admin/BookingsManagement';
import UsersManagement from '../components/admin/UsersManagement';
import ProfileEdit from '../pages/ProfileEdit';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
    { id: 'rooms', label: 'Rooms', icon: FaBox },
    { id: 'bookings', label: 'Bookings', icon: FaBookmark },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'rooms':
        return <RoomsManagement />;
      case 'bookings':
        return <BookingsManagement />;
      case 'users':
        return <UsersManagement />;
      case 'settings':
        return <ProfileEdit />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage your hotel operations</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600'
                        : 'text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
                    }`}
                  >
                    <Icon /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;