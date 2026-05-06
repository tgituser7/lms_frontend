'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface CourseItem {
  _id: string;
  title: string;
  category: string;
  level: string;
}

interface EnrollmentItem {
  _id: string;
  course: CourseItem;
  progress: number;
  enrolledAt: string;
}

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', bio: '', password: '', confirmPassword: '' });
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [allCourses, setAllCourses] = useState<CourseItem[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminAPI.getUser(id),
      adminAPI.getStudentEnrollments(id),
      adminAPI.getCourses(),
    ])
      .then(([userRes, enrollRes, coursesRes]) => {
        const u = userRes.data.user;
        setForm({ name: u.name, email: u.email, bio: u.bio || '', password: '', confirmPassword: '' });
        setEnrollments(enrollRes.data.enrollments);
        setAllCourses(coursesRes.data.courses);
      })
      .catch(() => router.push('/admin/students'))
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
      toast('Student updated successfully', 'success');
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update student', 'error');
    } finally {
      setSaving(false);
    }
  };

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course._id));
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(c._id));

  const handleEnroll = async () => {
    if (!selectedCourse) return;
    const courseName = allCourses.find((c) => c._id === selectedCourse)?.title || 'course';
    setEnrollLoading(true);
    try {
      await adminAPI.enrollStudent(id, selectedCourse);
      const enrolled = await adminAPI.getStudentEnrollments(id);
      setEnrollments(enrolled.data.enrollments);
      setSelectedCourse('');
      toast(`Enrolled in "${courseName}"`, 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to enroll', 'error');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleUnenroll = async (courseId: string, courseName: string) => {
    if (!confirm(`Remove student from "${courseName}"?`)) return;
    setUnenrollingId(courseId);
    try {
      await adminAPI.unenrollStudent(id, courseId);
      setEnrollments((prev) => prev.filter((e) => e.course._id !== courseId));
      toast(`Removed from "${courseName}"`, 'success');
    } catch {
      toast('Failed to unenroll', 'error');
    } finally {
      setUnenrollingId(null);
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
          <Link href="/admin/students" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">← Students</Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                    placeholder="Student bio..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
                </div>
              </div>
            </div>

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
              <Link href="/admin/students"
                className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Course Enrollments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Course Enrollments</h2>

          {/* Enroll in a new course */}
          {availableCourses.length > 0 && (
            <div className="flex gap-2 mb-5">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a course to enroll...</option>
                {availableCourses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
              <button
                onClick={handleEnroll}
                disabled={!selectedCourse || enrollLoading}
                className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {enrollLoading ? 'Enrolling...' : '+ Enroll'}
              </button>
            </div>
          )}

          {enrollments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Not enrolled in any courses yet.</p>
          ) : (
            <div className="space-y-2">
              {enrollments.map((e) => (
                <div key={e._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{e.course.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{e.course.category} · {e.course.level}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-xs text-gray-500">{e.progress || 0}% done</span>
                    <button
                      onClick={() => handleUnenroll(e.course._id, e.course.title)}
                      disabled={unenrollingId === e.course._id}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                    >
                      {unenrollingId === e.course._id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
