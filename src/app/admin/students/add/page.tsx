'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';

export default function AddStudentPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminAPI.createUser({ ...form, role: 'student' });
      const newId = res.data.user.id || res.data.user._id;
      router.push(`/admin/students/${newId}/edit`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="p-8 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/students" className="text-gray-400 hover:text-gray-600 transition-colors">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Student</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'student@example.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  minLength={f.name === 'password' ? 6 : 1}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Creating...' : 'Create Student'}
            </button>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
