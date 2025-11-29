import { useEffect } from 'react';
import { FaTag } from 'react-icons/fa';
import { useCRUD, useModalForm } from '../../hooks';
import { AdminHeader, AdminTable, AdminModal } from '../../features/admin';
import { supabase } from '../../utils/supabaseClient';

const PromotionsManagement = () => {
  const { data: promotions, isLoading, error, fetchData, create, update, remove } = useCRUD(
    'promotions',
    '*'
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
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    description: '',
    is_active: true
  });

  // Fetch promotions on mount
  useEffect(() => {
    fetchData({}, { column: 'code', ascending: true });
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const values = {
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description,
        is_active: formData.is_active
      };

      if (editingItem) {
        await update(editingItem.id, values, 'Promotion updated successfully');
      } else {
        await create(values, 'Promotion created successfully');
      }

      closeModal();
      resetFormData();
    } catch (err) {
      console.error('❌ Error saving promotion:', err);
    }
  };

  const handleEdit = (promotion) => {
    openEditModal(promotion);
  };

  const handleDelete = async (id) => {
    try {
      await remove(id, 'Promotion deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting promotion:', err);
    }
  };

  const formatDiscount = (promo) => {
    if (promo.discount_type === 'percentage') {
      return `${promo.discount_value}%`;
    }
    return `$${promo.discount_value}`;
  };

  const discountTypes = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount ($)' }
  ];

  // Table columns configuration
  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (value) => (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-semibold">
          <FaTag /> {value}
        </span>
      )
    },
    {
      key: 'discount_type',
      label: 'Discount Type',
      render: (value) => {
        const type = discountTypes.find(t => t.value === value);
        return <span className="text-sm">{type?.label || value}</span>;
      }
    },
    {
      key: 'discount_value',
      label: 'Value',
      render: (value, row) => <span className="font-semibold text-accent">{formatDiscount(row)}</span>
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
        title="Promotions Management"
        description="Create and manage discount codes (code, %, or fixed)"
        onAddNew={openCreateModal}
        addButtonLabel="Add New Promotion"
      />

      <AdminTable
        columns={columns}
        data={promotions}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={() => fetchData({}, { column: 'code', ascending: true })}
        emptyMessage="No promotions yet. Add your first promotion!"
      />

      <AdminModal
        isOpen={isModalOpen}
        title={editingItem ? 'Edit Promotion' : 'Add New Promotion'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel={editingItem ? 'Update' : 'Add Promotion'}
      >
        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">Code *</label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={(e) => updateFormData({ code: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent uppercase"
            placeholder="e.g., SUMMER2025"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">Discount Type *</label>
          <select
            required
            value={formData.discount_type}
            onChange={(e) => updateFormData({ discount_type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            {discountTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">
            Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '($)'}
          </label>
          <input
            type="number"
            required
            min="0"
            step={formData.discount_type === 'percentage' ? '1' : '0.01'}
            max={formData.discount_type === 'percentage' ? '100' : undefined}
            value={formData.discount_value}
            onChange={(e) => updateFormData({ discount_value: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder={formData.discount_type === 'percentage' ? '0-100' : '0.00'}
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
          <label className="block text-sm font-semibold mb-2 text-primary">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Description of this promotion..."
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

export default PromotionsManagement;
