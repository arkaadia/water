import React, { useState } from 'react';
import { apiClient } from '../services/apiClient';

interface LoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (response.user && response.user.access_token) {
           localStorage.setItem('access_token', response.user.access_token);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'ورود ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
        <h2 className="text-xl font-bold text-center text-slate-800 mb-6">ورود به سیستم</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نام کاربری</label>
            <input
              type="text"
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-left text-slate-800"
              dir="ltr"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رمز عبور</label>
            <input
              type="password"
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-left text-slate-800"
              dir="ltr"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold rounded-lg py-3 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
};
