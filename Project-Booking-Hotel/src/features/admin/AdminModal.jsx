/**
 * AdminModal Component
 * Reusable modal component for admin forms
 * Props:
 *   - isOpen: Boolean
 *   - title: String
 *   - onClose: Function
 *   - onSubmit: Function
 *   - isLoading: Boolean
 *   - children: ReactNode (form fields)
 *   - submitLabel: String
 */

import { FaCheck } from 'react-icons/fa';

const AdminModal = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  isLoading,
  children,
  submitLabel = 'Save'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="h3 text-primary">{title}</h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheck /> {isLoading ? 'Saving...' : submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-secondary btn-sm flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
