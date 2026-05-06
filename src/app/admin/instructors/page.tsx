'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getUsers('instructor')
      .then((res) => setInstructors(res.data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this instructor?')) return;
    try {
      await adminAPI.deleteUser(id);
      setInstructors((prev) => prev.filter((i) => i._id !== id));
    } catch {
      alert('Failed to delete instructor');
    }
  };

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
            <p className="text-gray-500 mt-1">{instructors.length} registered instructors</p>
          </div>
          <Link href="/admin/instructors/add" className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
            + Add Instructor
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : instructors.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">👨‍🏫</p>
              <p className="text-gray-500">No instructors yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Bio', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {instructors.map((inst) => (
                  <tr key={inst._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                          {inst.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{inst.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{inst.email}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">{inst.bio || '—'}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{new Date(inst.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/instructors/${inst._id}/edit`}
                          className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(inst._id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
