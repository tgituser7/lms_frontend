'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseAPI, enrollmentAPI, chapterAPI } from '@/lib/api';
import { Course, Chapter, ChapterProgress } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ChapterViewer from '@/components/ChapterViewer';
import AddChapterForm from '@/components/AddChapterForm';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const userId = user?.id || user?._id;
  const isAssigned = course && user && (
    user.role === 'admin' ||
    (user.role === 'instructor' && course.instructor?._id === userId)
  );

  const loadChapters = async () => {
    const res = await chapterAPI.getByCourse(id);
    setChapters(res.data.chapters);
  };

  useEffect(() => {
    if (authLoading) return;
    const load = async () => {
      try {
        const res = await courseAPI.getOne(id);
        setCourse(res.data.course);

        if (user) {
          if (user.role === 'student') {
            const enrollRes = await enrollmentAPI.getMyEnrollments();
            const enrollment = enrollRes.data.enrollments.find((e: any) => e.course._id === id);
            if (enrollment) {
              setEnrolled(true);
              setChapterProgress(enrollment.chapterProgress || []);
            }
          }
          const chapRes = await chapterAPI.getByCourse(id);
          setChapters(chapRes.data.chapters);
        } else {
          const chapRes = await chapterAPI.getByCourse(id);
          setChapters(chapRes.data.chapters);
        }
      } catch {
        router.push('/courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user, router, authLoading]);

  const handleProgressUpdate = async (chapterId: string, status: 'learning' | 'completed') => {
    try {
      const res = await chapterAPI.updateProgress(id, chapterId, status);
      setChapterProgress(res.data.enrollment.chapterProgress);
    } catch {
      alert('Failed to update progress');
    }
  };

  const getChapterStatus = (chapterId: string): 'learning' | 'completed' | null => {
    const p = chapterProgress.find((p) => p.chapter === chapterId);
    return p?.status || null;
  };

  const canView = (chapter: Chapter) => enrolled || isAssigned || chapter.isPreview;

  if (loading || authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
    </div>
  );
  if (!course) return null;

  const completedCount = chapterProgress.filter((p) => p.status === 'completed').length;
  const progress = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">{course.category}</span>
              <span className="text-xs text-gray-500 capitalize">{course.level}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          {/* Instructor info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Instructor</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                {course.instructor?.name?.[0] || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{course.instructor?.name || 'Unassigned'}</p>
                {course.instructor?.bio && <p className="text-sm text-gray-500">{course.instructor.bio}</p>}
              </div>
            </div>
          </div>

          {/* Progress bar for students */}
          {enrolled && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Progress</span>
                <span className="text-sm font-semibold text-primary-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-primary-500 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{completedCount} of {chapters.length} chapters completed</p>
            </div>
          )}

          {/* Chapter List */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Chapters ({chapters.length})
              </h2>
              {isAssigned && (
                <button onClick={() => setShowAddForm(!showAddForm)}
                  className="text-sm bg-primary-600 text-white px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  {showAddForm ? 'Cancel' : '+ Add Chapter'}
                </button>
              )}
            </div>

            {showAddForm && (
              <div className="mb-4">
                <AddChapterForm
                  courseId={id}
                  nextOrder={chapters.length + 1}
                  onCreated={async () => { await loadChapters(); setShowAddForm(false); }}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            )}

            {chapters.length === 0 ? (
              <p className="text-gray-400 text-sm">No chapters yet.</p>
            ) : (
              <div className="space-y-2">
                {chapters.map((chapter, idx) => {
                  const status = getChapterStatus(chapter._id);
                  const accessible = canView(chapter);
                  return (
                    <div
                      key={chapter._id}
                      onClick={() => accessible ? setActiveChapter(chapter) : null}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        activeChapter?._id === chapter._id ? 'border-primary-200 bg-primary-50' : 'border-gray-100 hover:bg-gray-50'
                      } ${accessible ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        status === 'completed' ? 'bg-green-100 text-green-600' :
                        status === 'learning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {status === 'completed' ? '✓' : status === 'learning' ? '⏳' : idx + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium text-gray-700">{chapter.title}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {chapter.hasVideo && <span className="text-xs text-gray-400">🎥</span>}
                        {chapter.hasPdf && <span className="text-xs text-gray-400">📄</span>}
                        {chapter.hasSummary && <span className="text-xs text-gray-400">📋</span>}
                        {chapter.isPreview && !enrolled && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Preview</span>
                        )}
                        {!accessible && <span className="text-gray-400 text-sm">🔒</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chapter Viewer */}
          {activeChapter && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <ChapterViewer
                chapter={activeChapter}
                courseId={id}
                onProgressUpdate={user?.role === 'student' ? handleProgressUpdate : undefined}
                currentStatus={getChapterStatus(activeChapter._id)}
                isStudent={user?.role === 'student'}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {course.price === 0 ? 'Free' : `₹${course.price}`}
            </div>
            <p className="text-sm text-gray-500 mb-6">{course.enrolledStudents?.length || 0} students enrolled</p>

            {isAssigned && (
              <Link
                href={`/courses/${id}/manage`}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors mb-3 text-sm"
              >
                ✏️ Manage Course
              </Link>
            )}

            {user?.role === 'instructor' || user?.role === 'admin' ? (
              <div className="bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-3 text-sm text-center">
                Instructors cannot enroll in courses
              </div>
            ) : enrolled ? (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-3 text-sm font-medium">
                  You are enrolled!
                </div>
                <div className="text-xs text-gray-400">{progress}% complete</div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-3 text-sm text-center">
                Enrollment is managed by the administrator
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
