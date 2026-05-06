'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';

export default function AddInstructorPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminAPI.createUser({ ...form, role: 'instructor' });
      router.push('/admin/instructors');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create instructor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="p-8 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/instructors" className="text-gray-400 hover:text-gray-600 transition-colors">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Instructor</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                placeholder="John Smith"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="instructor@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bio <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                placeholder="Brief biography..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Creating...' : 'Create Instructor'}
            </button>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
