import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export const GroupManagementPanel: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/groups');
      setGroups(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری گروه‌ها...</div>;
  if (error) return <div className="text-red-500">خطا: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-6">مدیریت گروه‌ها (Phase 2)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 border-b">نام گروه</th>
              <th className="p-4 border-b">توضیحات</th>
              <th className="p-4 border-b">تعداد اعضا</th>
              <th className="p-4 border-b">دسترسی‌ها</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id} className="border-b hover:bg-slate-50">
                <td className="p-4">{g.name}</td>
                <td className="p-4">{g.description}</td>
                <td className="p-4">{g._count.users}</td>
                <td className="p-4 text-xs">
                  {g.permissions.map((p: any) => p.code).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
