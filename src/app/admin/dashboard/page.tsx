'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';
import { Stats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Students', value: stats.totalStudents, icon: '🎓', color: 'bg-blue-500' },
        { label: 'Total Instructors', value: stats.totalInstructors, icon: '👨‍🏫', color: 'bg-purple-500' },
        { label: 'Total Technologies', value: stats.totalCourses, icon: '📚', color: 'bg-green-500' },
        { label: 'Total Enrollments', value: stats.totalEnrollments, icon: '📝', color: 'bg-orange-500' },
      ]
    : [];

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your LMS platform</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((c) => (
              <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-4 shadow-sm">
                <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                  <p className="text-sm text-gray-500">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
