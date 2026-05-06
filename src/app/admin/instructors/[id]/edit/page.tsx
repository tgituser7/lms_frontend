'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function EditInstructorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', bio: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.getUser(id)
      .then((res) => {
        const u = res.data.user;
        setForm({ name: u.name, email: u.email, bio: u.bio || '', password: '', confirmPassword: '' });
      })
      .catch(() => router.push('/admin/instructors'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast('Passwords do not match', 'error'); return;
    }
    if (form.password && form.password.length < 6) {
      toast('Password must be at least 6 characters', 'error'); return;
    }
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email, bio: form.bio };
      if (form.password) payload.password = form.password;
      await adminAPI.updateUser(id, payload);
      toast('Instructor updated successfully', 'success');
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update instructor', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminGuard>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
      </div>
    </AdminGuard>
  );

  return (
    <AdminGuard>
      <div className="p-8 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/instructors" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">← Instructors</Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Instructor</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Info */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
                    placeholder="Instructor biography, expertise, experience..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Change Password</h2>
              <p className="text-xs text-gray-400 mb-3">Leave blank to keep current password</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange}
                    minLength={6} placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link href="/admin/instructors"
                className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
