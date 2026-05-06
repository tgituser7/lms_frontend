'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';
import { Course, User } from '@/types';

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminAPI.getCourses(), adminAPI.getUsers('instructor')])
      .then(([cRes, iRes]) => {
        setCourses(cRes.data.courses);
        setInstructors(iRes.data.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async (courseId: string, instructorId: string) => {
    try {
      const res = await adminAPI.assignInstructor(courseId, instructorId);
      setCourses((prev) => prev.map((c) => c._id === courseId ? res.data.course : c));
      setAssigning(null);
    } catch {
      alert('Failed to assign instructor');
    }
  };

  const handleTogglePublish = async (courseId: string) => {
    try {
      const res = await adminAPI.togglePublish(courseId);
      setCourses((prev) => prev.map((c) => c._id === courseId ? res.data.course : c));
    } catch {
      alert('Failed to update course');
    }
  };

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-500 mt-1">{courses.length} courses total</p>
          </div>
          <Link href="/admin/courses/add" className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
            + Add Course
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-gray-500">No courses yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Course', 'Level', 'Instructor', 'Students', 'Status', 'Actions'].map((h) => (
                    <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-xs text-gray-400">{course.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${levelColors[course.level]}`}>
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {assigning === course._id ? (
                        <select
                          autoFocus
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) handleAssign(course._id, e.target.value); }}
                          onBlur={() => setAssigning(null)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="" disabled>Select instructor</option>
                          {instructors.map((i) => (
                            <option key={i._id} value={i._id}>{i.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{course.instructor?.name || '—'}</span>
                          <button onClick={() => setAssigning(course._id)} className="text-xs text-green-600 hover:underline">
                            {course.instructor ? 'Change' : 'Assign'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{course.enrolledStudents?.length || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/courses/${course._id}/chapters`}
                          className="text-sm text-purple-500 hover:text-purple-700 font-medium transition-colors">
                          Chapters
                        </Link>
                        <Link href={`/admin/courses/${course._id}/edit`}
                          className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => handleTogglePublish(course._id)}
                          className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors">
                          {course.isPublished ? 'Unpublish' : 'Publish'}
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
