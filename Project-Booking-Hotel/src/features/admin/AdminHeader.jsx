/**
 * AdminHeader Component
 * Reusable header for admin sections
 * Props:
 *   - title: String
 *   - description: String
 *   - onAddNew: Function
 *   - addButtonLabel: String
 */

import { FaPlus } from 'react-icons/fa';

const AdminHeader = ({
  title,
  description,
  onAddNew,
  addButtonLabel = 'Add New'
}) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="h2 text-primary mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <button
          onClick={onAddNew}
          className="btn btn-primary btn-sm flex items-center gap-2 w-auto"
        >
          <FaPlus /> {addButtonLabel}
        </button>
      </div>
    </>
  );
};

export default AdminHeader;
