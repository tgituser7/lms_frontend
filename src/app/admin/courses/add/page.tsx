'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import { useToast } from '@/context/ToastContext';

const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'DevOps', 'Other'];

export default function AddCoursePage() {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Web Development',
    level: 'beginner', price: '0', instructor: '', isPublished: false,
  });
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    adminAPI.getUsers('instructor').then((res) => setInstructors(res.data.users)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createCourse({ ...form, price: Number(form.price) });
      router.push('/admin/courses');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to create course', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/courses" className="text-gray-400 hover:text-gray-600 transition-colors">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Course</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Title</label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="e.g. Introduction to React"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
                placeholder="Course description..."
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
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Instructor</label>
                <select name="instructor" value={form.instructor} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">— Select Instructor —</option>
                  {instructors.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPublished" name="isPublished" checked={form.isPublished}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Publish immediately</label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
