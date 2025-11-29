import { useState, useEffect } from 'react';
import { useCRUD, useModalForm } from '../../hooks';
import { AdminHeader, AdminTable, AdminModal } from '../../features/admin';
import { supabase } from '../../utils/supabaseClient';

const RoomTypesManagement = () => {
  const [amenities, setAmenities] = useState([]); // State for available amenities
  const { data: roomTypes, isLoading, error, fetchData, create, update, remove } = useCRUD(
    'room_types',
    '*'
  );
  
  // Fetch amenities from DB on mount
  useEffect(() => {
    const fetchAmenities = async () => {
      const { data, error } = await supabase.from('amenities').select('name').order('name');
      if (error) {
        console.error('Error fetching amenities:', error);
      } else {
        setAmenities(data?.map(item => item.name) || []);
      }
    };
    fetchAmenities();
  }, []);

  const {
    isModalOpen,
    editingItem,
    formData,
    updateFormData,
    openCreateModal,
    openEditModal,
    closeModal,
    resetFormData
  } = useModalForm({
    code: '',
    name: '',
    description: '',
    base_capacity: '',
    max_person: '',
    base_price: '',
    facilities: [],
    is_active: true
  });

  // Fetch room types on mount
  useEffect(() => {
    fetchData({}, { column: 'code', ascending: true });
  }, [fetchData]);

  const toggleFacility = (facilityName) => {
    updateFormData({
      facilities: formData.facilities.includes(facilityName)
        ? formData.facilities.filter(name => name !== facilityName)
        : [...formData.facilities, facilityName],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const values = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        base_capacity: parseInt(formData.base_capacity) || 1,
        max_person: parseInt(formData.max_person) || 2,
        base_price: parseFloat(formData.base_price) || 0,
        facilities: formData.facilities,
        is_active: formData.is_active
      };

      if (editingItem) {
        await update(editingItem.id, values, 'Room type updated successfully');
      } else {
        await create(values, 'Room type created successfully');
      }

      closeModal();
      resetFormData();
    } catch (err) {
      console.error('❌ Error saving room type:', err);
    }
  };

  const handleEdit = (roomType) => {
    openEditModal(roomType);
  };

  const handleDelete = async (id) => {
    try {
      await remove(id, 'Room type deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting room type:', err);
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (value) => <span className="font-mono font-semibold text-accent">{value}</span>
    },
    {
      key: 'name',
      label: 'Name',
      render: (value) => <span className="font-semibold">{value}</span>
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => <span className="text-sm text-gray-600">{value || '-'}</span>
    },
    {
      key: 'max_person',
      label: 'Max Guests',
      render: (value) => <span>{value}</span>
    },
    {
      key: 'base_price',
      label: 'Price',
      render: (value) => <span className="font-semibold text-accent">${value}</span>
    },
    {
      key: 'facilities',
      label: 'Amenities',
      render: (value) => <span className="text-sm text-gray-600">{value?.length || 0} amenities</span>
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? '✓ Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div>
      <AdminHeader
        title="Room Types Management"
        description="Add, edit, delete and manage room types"
        onAddNew={openCreateModal}
        addButtonLabel="Add New Room Type"
      />

      <AdminTable
        columns={columns}
        data={roomTypes}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={() => fetchData({}, { column: 'code', ascending: true })}
        emptyMessage="No room types yet. Add your first room type!"
      />

      <AdminModal
        isOpen={isModalOpen}
        title={editingItem ? 'Edit Room Type' : 'Add New Room Type'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel={editingItem ? 'Update' : 'Add New'}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-primary">Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => updateFormData({ code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="e.g., STD, DLX, SUI"
              maxLength="10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-primary">Room Type Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="e.g., Deluxe Room"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Description about the room type..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-primary">Base Capacity *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.base_capacity}
              onChange={(e) => updateFormData({ base_capacity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-primary">Max Guests *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.max_person}
              onChange={(e) => updateFormData({ max_person: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">Base Price (USD) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => updateFormData({ base_price: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Facility selection for array field */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">
            Facilities / Amenities ({formData.facilities.length} selected)
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4">
            {amenities.map((facility) => (
              <button
                key={facility}
                type="button"
                onClick={() => toggleFacility(facility)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${
                  formData.facilities.includes(facility)
                    ? 'bg-accent text-white border-accent'
                    : 'bg-gray-100 text-primary border-gray-300 hover:bg-gray-200'
                }`}
              >
                {formData.facilities.includes(facility) ? <FaCheck className="inline mr-1" /> : ''}
                {facility}
              </button>
            ))}
            {amenities.length === 0 && <p className="text-sm text-gray-500">No amenities defined. Please add them in Amenities Management.</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => updateFormData({ is_active: e.target.checked })}
              className="mr-2"
            />
            Active
          </label>
        </div>
      </AdminModal>
    </div>
  );
};

export default RoomTypesManagement;
