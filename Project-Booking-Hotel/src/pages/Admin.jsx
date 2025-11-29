import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import RoomTypesManagement from '../components/admin/RoomTypesManagement';
import RoomsManagement from '../components/admin/RoomsManagement';
import PriceRulesManagement from '../components/admin/PriceRulesManagement';
import PromotionsManagement from '../components/admin/PromotionsManagement';
import BookingsManagement from '../components/admin/BookingsManagement';
import UsersManagement from '../components/admin/UsersManagement';
import AuditLogsManagement from '../components/admin/AuditLogsManagement';
import ReportsManagement from '../components/admin/ReportsManagement';

const Admin = () => {
  const [activeSection, setActiveSection] = useState('room-types');

  const renderContent = () => {
    switch (activeSection) {
      case 'room-types':
        return <RoomTypesManagement />;
      case 'rooms':
        return <RoomsManagement />;
      case 'price-rules':
        return <PriceRulesManagement />;
      case 'promotions':
        return <PromotionsManagement />;
      case 'bookings':
        return <BookingsManagement />;
      case 'users':
        return <UsersManagement />;
      case 'audit-logs':
        return <AuditLogsManagement />;
      case 'reports':
        return <ReportsManagement />;
      default:
        return <RoomTypesManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex relative">
        {/* Sidebar */}
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

