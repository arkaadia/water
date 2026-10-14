import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/users');
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری کاربران...</div>;
  if (error) return <div className="text-red-500">خطا: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-6">مدیریت کاربران (Phase 2)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 border-b">نام کاربری</th>
              <th className="p-4 border-b">نام نمایشی</th>
              <th className="p-4 border-b">وضعیت</th>
              <th className="p-4 border-b">گروه‌ها</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b hover:bg-slate-50">
                <td className="p-4">{u.username}</td>
                <td className="p-4">{u.displayName}</td>
                <td className="p-4">{u.status}</td>
                <td className="p-4">
                  {u.groups.map((g: any) => g.name).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
