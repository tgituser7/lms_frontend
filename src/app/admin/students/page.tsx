'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    adminAPI.getUsers('student')
      .then((res) => setStudents(res.data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete student "${name}"?`)) return;
    try {
      await adminAPI.deleteUser(id);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      toast(`Student "${name}" deleted`, 'success');
    } catch {
      toast('Failed to delete student', 'error');
    }
  };

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-500 mt-1">{students.length} registered students</p>
          </div>
          <Link href="/admin/students/add" className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
            + Add Student
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">🎓</p>
              <p className="text-gray-500">No students yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {s.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{s.email}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/students/${s._id}/edit`}
                          className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(s._id, s.name)} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
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
