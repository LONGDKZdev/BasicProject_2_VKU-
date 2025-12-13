/**
 * ============================================================================
 * SERVICE SELECTOR - REUSABLE COMPONENT
 * ============================================================================
 * 
 * Component độc lập để chọn service/menu item trong form
 * Tích hợp vào form thay vì phải scroll lên xuống
 * 
 * Usage:
 * <ServiceSelector 
 *   type="restaurant" | "spa"
 *   items={menuItems} // hoặc spaServices
 *   selected={selectedItem}
 *   onSelect={handleSelect}
 *   className="..."
 * />
 * ============================================================================
 */

import { useState } from 'react';
import { FaUtensils, FaSpa, FaCheck } from 'react-icons/fa';

const ServiceSelector = ({
  type = 'restaurant', // 'restaurant' | 'spa'
  items = [], // Array of menu items or spa services
  selected = null, // Selected item ID or name
  onSelect = null, // Callback: (item) => void
  className = '',
  showImage = true,
  maxHeight = '300px'
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term)
    );
  });

  const handleItemClick = (item) => {
    if (onSelect) {
      onSelect(item);
    }
  };

  const getIcon = () => {
    return type === 'restaurant' ? <FaUtensils /> : <FaSpa />;
  };

  const getTitle = () => {
    return type === 'restaurant' ? 'Select Menu Item' : 'Select Service';
  };

  if (items.length === 0) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded ${className}`}>
        <div className="text-sm text-gray-500">No {type === 'restaurant' ? 'menu items' : 'services'} available</div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          {getIcon()}
          <span>{getTitle()}</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder={`Search ${type === 'restaurant' ? 'menu items' : 'services'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm"
        />
      </div>

      {/* Items List */}
      <div 
        className="overflow-y-auto p-3"
        style={{ maxHeight }}
      >
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No items found
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selected === item.id || selected === item.name;
              
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full p-3 border-2 rounded-lg text-left transition-all
                    ${isSelected 
                      ? 'border-accent bg-accent/10' 
                      : 'border-gray-200 hover:border-accent/50 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {showImage && item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                        {isSelected && (
                          <FaCheck className="text-accent flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                      
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-2">
                        {item.price && (
                          <span className="text-sm font-semibold text-accent">
                            ${item.price}
                          </span>
                        )}
                        {item.duration && (
                          <span className="text-xs text-gray-500">
                            {item.duration}
                          </span>
                        )}
                        {item.popular && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelector;

