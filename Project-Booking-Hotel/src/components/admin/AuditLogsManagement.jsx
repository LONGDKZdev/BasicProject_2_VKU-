import { useEffect } from 'react';
import { useCRUD } from '../../hooks';
import { AdminHeader, AdminTable } from '../../features/admin';
const AuditLogsManagement = () => {
  const { data: logs, isLoading, error, fetchData } = useCRUD(
    'audit_logs',
    '*'
  );

  useEffect(() => {
    fetchData({}, { column: 'created_at', ascending: false });
  }, [fetchData]);

  // Table columns configuration
  const columns = [
    {
      key: 'actor',
      label: 'Actor',
      render: (value) => <span className="font-semibold">{value || 'System'}</span>
    },
    {
      key: 'action',
      label: 'Action',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          value === 'create' ? 'bg-green-100 text-green-800' :
          value === 'update' ? 'bg-blue-100 text-blue-800' :
          value === 'delete' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value?.toUpperCase() || 'N/A'}
        </span>
      )
    },
    {
      key: 'table_name',
      label: 'Table',
      render: (value) => <span className="font-mono text-sm">{value || '-'}</span>
    },
    {
      key: 'record_id',
      label: 'Record ID',
      render: (value) => <span className="text-sm">{value || '-'}</span>
    },
    {
      key: 'changes',
      label: 'Changes',
      render: (value) => <span className="text-sm text-gray-600">{value ? 'Yes' : 'No'}</span>
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (value) => <span className="text-sm">{value ? new Date(value).toLocaleString() : '-'}</span>
    }
  ];

  return (
    <div>
      <AdminHeader
        title="Audit Logs"
        description="Admin action history - Record CRUD operations"
      />

      <AdminTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        error={error}
        onRetry={() => fetchData({}, { column: 'created_at', ascending: false })}
        emptyMessage="No data found"
      />
    </div>
  );
};

export default AuditLogsManagement;
