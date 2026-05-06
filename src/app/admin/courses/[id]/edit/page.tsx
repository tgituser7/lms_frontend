'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import { useToast } from '@/context/ToastContext';

const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'DevOps', 'Other'];

export default function AdminEditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', category: '', level: '', price: '0', instructor: '', isPublished: false,
  });
  const [instructors, setInstructors] = useState<User[]>([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([adminAPI.getCourse(id), adminAPI.getUsers('instructor')])
      .then(([cRes, iRes]) => {
        const c = cRes.data.course;
        setForm({
          title: c.title,
          description: c.description,
          category: c.category,
          level: c.level,
          price: String(c.price),
          instructor: c.instructor?._id || '',
          isPublished: c.isPublished,
        });
        setInstructors(iRes.data.users);
      })
      .catch(() => router.push('/admin/courses'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updateCourse(id, { ...form, price: Number(form.price) });
      toast('Course updated successfully', 'success');
      router.push('/admin/courses');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update course', 'error');
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
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/courses" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Title</label>
              <input name="title" value={form.title} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
                <select name="level" value={form.level} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instructor</label>
                <select name="instructor" value={form.instructor} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">— Unassigned —</option>
                  {instructors.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPublished" name="isPublished" checked={form.isPublished}
                onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Published</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link href="/admin/courses"
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
