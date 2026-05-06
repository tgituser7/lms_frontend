'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseAPI, chapterAPI } from '@/lib/api';
import { Course, Chapter } from '@/types';
import { useAuth } from '@/context/AuthContext';
import AddChapterForm from '@/components/AddChapterForm';
import EditChapterForm from '@/components/EditChapterForm';

export default function ManageCoursePage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const userId = user?.id || user?._id;
  const isAssigned = course && user && (
    user.role === 'admin' ||
    (user.role === 'instructor' && course.instructor?._id === userId)
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    const load = async () => {
      try {
        const [courseRes, chapRes] = await Promise.all([
          courseAPI.getOne(id),
          chapterAPI.getByCourse(id),
        ]);
        setCourse(courseRes.data.course);
        setChapters(chapRes.data.chapters);
      } catch {
        router.push('/courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router, user, authLoading]);

  useEffect(() => {
    if (authLoading || loading) return;
    if (!user || !isAssigned) router.replace(`/courses/${id}`);
  }, [loading, authLoading, user, isAssigned, id, router]);

  const loadChapters = async () => {
    const res = await chapterAPI.getByCourse(id);
    setChapters(res.data.chapters);
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm('Delete this chapter? This will also remove uploaded files.')) return;
    setDeletingId(chapterId);
    try {
      await chapterAPI.delete(id, chapterId);
      setChapters((prev) => prev.filter((c) => c._id !== chapterId));
    } catch {
      alert('Failed to delete chapter');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
    </div>
  );
  if (!course || !isAssigned) return null;

  const contentIcon = (chapter: Chapter) => {
    if (chapter.hasVideo) return '🎥';
    if (chapter.hasPdf) return '📄';
    if (chapter.hasSummary) return '📋';
    if (chapter.hasContent) return '📝';
    return '📖';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/courses/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
          ← Back to Course
        </Link>
      </div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{course.category}</span>
            <span className="text-xs text-gray-400 capitalize">{course.level}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${course.isPublished ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingChapter(null); }}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm flex-shrink-0"
        >
          + Add Chapter
        </button>
      </div>

      {/* Add Chapter Form */}
      {showAddForm && (
        <div className="mb-6">
          <AddChapterForm
            courseId={id}
            nextOrder={chapters.length + 1}
            onCreated={async () => { await loadChapters(); setShowAddForm(false); }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Edit Chapter Form */}
      {editingChapter && (
        <div className="mb-6">
          <EditChapterForm
            courseId={id}
            chapter={editingChapter}
            onUpdated={async () => { await loadChapters(); setEditingChapter(null); }}
            onCancel={() => setEditingChapter(null)}
          />
        </div>
      )}

      {/* Chapter List */}
      <div className="space-y-3">
        {chapters.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-500 font-medium mb-1">No chapters yet</p>
            <p className="text-sm text-gray-400">Click "Add Chapter" to get started</p>
          </div>
        ) : (
          chapters.map((chapter, idx) => (
            <div key={chapter._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 p-4">
                {/* Order badge */}
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{contentIcon(chapter)}</span>
                    <h3 className="font-semibold text-gray-900 truncate">{chapter.title}</h3>
                    {chapter.isPreview && (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex-shrink-0">Preview</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {chapter.hasVideo && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Video</span>}
                    {chapter.youtubeUrl && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">YouTube</span>}
                    {chapter.hasPdf && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">PDF</span>}
                    {chapter.hasSummary && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Summary</span>}
                    {chapter.hasContent && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Notes</span>}
                    {chapter.duration && <span className="text-xs text-gray-400">{chapter.duration} min</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditingChapter(chapter); setShowAddForm(false); }}
                    className="text-sm text-blue-500 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(chapter._id)}
                    disabled={deletingId === chapter._id}
                    className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === chapter._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {chapters.length > 0 && (
        <p className="text-center text-sm text-gray-400 mt-6">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''} total</p>
      )}
    </div>
  );
}
