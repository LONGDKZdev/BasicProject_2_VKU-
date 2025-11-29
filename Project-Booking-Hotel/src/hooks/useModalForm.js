/**
 * Custom Hook: useModalForm
 * Reusable modal form management
 * Handles: Open/Close modal, Edit/Create mode, Form data reset
 */

import { useState, useCallback } from 'react';

export const useModalForm = (initialFormData) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // Open modal for creating new item
  const openCreateModal = useCallback(() => {
    setEditingItem(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  }, [initialFormData]);

  // Open modal for editing existing item
  const openEditModal = useCallback((item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormData);
  }, [initialFormData]);

  // Update form data
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset form data
  const resetFormData = useCallback(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  return {
    isModalOpen,
    editingItem,
    formData,
    setFormData,
    openCreateModal,
    openEditModal,
    closeModal,
    updateFormData,
    resetFormData,
    isEditing: !!editingItem
  };
};
