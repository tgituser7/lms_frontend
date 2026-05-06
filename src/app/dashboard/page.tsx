'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { enrollmentAPI, courseAPI } from '@/lib/api';
import { Enrollment, Course } from '@/types';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (user.role === 'student') {
          const res = await enrollmentAPI.getMyEnrollments();
          setEnrollments(res.data.enrollments);
        } else if (user.role === 'instructor' || user.role === 'admin') {
          const res = await courseAPI.getMyCourses();
          setMyCourses(res.data.courses);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
        <p className="text-gray-500 mt-1 capitalize">{user.role} Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {user.role === 'student' ? (
          <>
            <StatCard label="Enrolled Courses" value={enrollments.length} icon="📚" />
            <StatCard label="In Progress" value={enrollments.filter(e => e.progress > 0 && e.progress < 100).length} icon="⏳" />
            <StatCard label="Completed" value={enrollments.filter(e => e.progress === 100).length} icon="✅" />
          </>
        ) : (
          <>
            <StatCard label="My Courses" value={myCourses.length} icon="🎓" />
            <StatCard label="Published" value={myCourses.filter(c => c.isPublished).length} icon="✅" />
            <StatCard label="Total Students" value={myCourses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0)} icon="👥" />
          </>
        )}
      </div>

      {user.role === 'student' ? (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
            <Link href="/courses" className="text-primary-600 text-sm font-medium hover:underline">Browse more →</Link>
          </div>
          {enrollments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-5xl mb-4">📖</p>
              <p className="text-gray-600 font-medium mb-4">You haven&apos;t enrolled in any courses yet</p>
              <Link href="/courses" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-block">
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map((enrollment) => (
                <Link key={enrollment._id} href={`/courses/${enrollment.course._id}`}>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="font-semibold text-gray-900 mb-1">{enrollment.course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{enrollment.course.category}</p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">{enrollment.progress}% complete</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
          </div>
          {myCourses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-5xl mb-4">🎓</p>
              <p className="text-gray-600 font-medium mb-4">You haven&apos;t created any courses yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myCourses.map((course) => (
                <Link key={course._id} href={`/courses/${course._id}`}>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{course.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${course.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.enrolledStudents?.length || 0} students enrolled</p>
                    <Link
                      href={`/courses/${course._id}/manage`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      ✏️ Manage Chapters
                    </Link>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
