import { useEffect, useState } from 'react';
import { useCRUD, useModalForm } from '../../hooks';
import { AdminHeader, AdminTable, AdminModal } from '../../features/admin';
import { supabase } from '../../utils/supabaseClient';

const PriceRulesManagement = () => {
  const { data: priceRules, isLoading, error, fetchData, create, update, remove } = useCRUD(
    'price_rules',
    `
      *,
      room_types:room_type_id (code, name)
    `
  );

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
    rule_type: 'weekend',
    room_type_id: '',
    price: '',
    apply_fri: false,
    apply_sat: true,
    apply_sun: true,
    start_date: '',
    end_date: '',
    description: '',
    priority: '10',
    is_active: true
  });

  // Fetch room types for dropdown
  const [roomTypes, setRoomTypes] = useState([]);
  
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const { supabase } = await import('../../utils/supabaseClient');
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('code');
      if (error) throw error;
      setRoomTypes(data || []);
    } catch (err) {
      console.error('❌ Error fetching room types:', err);
    }
  };

  // Fetch price rules on mount
  useEffect(() => {
    fetchData({}, { column: 'priority', ascending: true });
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const values = {
        rule_type: formData.rule_type,
        room_type_id: formData.room_type_id || null,
        price: parseFloat(formData.price),
        apply_fri: formData.apply_fri,
        apply_sat: formData.apply_sat,
        apply_sun: formData.apply_sun,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description,
        priority: parseInt(formData.priority),
        is_active: formData.is_active
      };

      if (editingItem) {
        await update(editingItem.id, values, 'Price rule updated successfully');
      } else {
        await create(values, 'Price rule created successfully');
      }

      closeModal();
      resetFormData();
    } catch (err) {
      console.error('❌ Error saving price rule:', err);
    }
  };

  const handleEdit = (rule) => {
    openEditModal(rule);
  };

  const handleDelete = async (id) => {
    try {
      await remove(id, 'Price rule deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting price rule:', err);
    }
  };

  const ruleTypes = [
    { value: 'weekend', label: 'Weekend' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'season', label: 'Season' },
  ];

  const columns = [
    {
      key: 'rule_type',
      label: 'Rule Type',
      render: (value) => {
        const type = ruleTypes.find(t => t.value === value);
        return (
          <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-semibold">
            {type?.label || value}
          </span>
        );
      }
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => <span>{value || '-'}</span>
    },
    {
      key: 'price',
      label: 'Price',
      render: (value) => <span className="font-semibold text-accent">${value}</span>
    },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (value) => <span>{value || '-'}</span>
    },
    {
      key: 'end_date',
      label: 'End Date',
      render: (value) => <span>{value || '-'}</span>
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
        title="Price Rules Management"
        description="Set weekend, season and holiday prices - automatically apply by schedule"
        onAddNew={openCreateModal}
        addButtonLabel="Add New Price Rule"
      />

      <AdminTable
        columns={columns}
        data={priceRules}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={() => fetchData({}, { column: 'priority', ascending: true })}
        emptyMessage="No price rules yet. Add your first rule!"
      />

      <AdminModal
        isOpen={isModalOpen}
        title={editingItem ? 'Edit Price Rule' : 'Add New Price Rule'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel={editingItem ? 'Update' : 'Add Rule'}
      >
        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">Rule Type *</label>
          <select
            required
            value={formData.rule_type}
            onChange={(e) => updateFormData({ rule_type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            {ruleTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">Room Type</label>
          <select
            value={formData.room_type_id}
            onChange={(e) => updateFormData({ room_type_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">All Room Types</option>
            {roomTypes.map(rt => (
              <option key={rt.id} value={rt.id}>{rt.code} - {rt.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">Price (USD) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => updateFormData({ price: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-primary">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => updateFormData({ start_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-primary">End Date</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => updateFormData({ end_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">Priority</label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.priority}
            onChange={(e) => updateFormData({ priority: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Description of this price rule..."
          />
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

export default PriceRulesManagement;
